import { Composio } from '@composio/core';
import { supabase } from '../db/client';

const GMAIL_ENTITY_COOKIE = 'mailsense_gmail_entity_id';

export interface GmailUserSession {
  userId: string;
  shouldSetCookie: boolean;
}

// Validate Composio API configuration
export function validateConfig() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('COMPOSIO_API_KEY is not configured in your environment. Please add it to your .env file.');
  }
}

// Singleton instances
let composioInstance: Composio | null = null;

export function getComposioClient(): Composio {
  validateConfig();
  if (!composioInstance) {
    composioInstance = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
  }
  return composioInstance;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function createConnectorEntityId(): string {
  return `gmail_${crypto.randomUUID()}`;
}

export function getGmailUserSession(req: Request): GmailUserSession {
  const headerEntityId = req.headers.get('x-mailsense-gmail-entity-id');
  const cookieEntityId = readCookie(req.headers.get('cookie'), GMAIL_ENTITY_COOKIE);
  const userId = headerEntityId || cookieEntityId || createConnectorEntityId();

  return {
    userId,
    shouldSetCookie: !cookieEntityId,
  };
}

export function setGmailUserCookie(response: Response, session: GmailUserSession) {
  if (!session.shouldSetCookie) return;

  const cookie = [
    `${GMAIL_ENTITY_COOKIE}=${encodeURIComponent(session.userId)}`,
    'Path=/',
    'Max-Age=31536000',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
    'HttpOnly',
  ].filter(Boolean).join('; ');

  response.headers.append('Set-Cookie', cookie);
}

export function isGmailConnection(connection: any): boolean {
  const appName = String(
    connection?.appName || 
    connection?.app || 
    connection?.appKey || 
    connection?.toolkit?.slug || 
    ''
  ).toLowerCase();
  const integrationId = String(connection?.integrationId || '').toLowerCase();
  const status = String(connection?.status || '').toUpperCase();
  const enabled = connection?.enabled !== false && connection?.isDisabled !== true;

  return enabled && status !== 'DISABLED' && status !== 'DELETED' && (
    appName === 'gmail' ||
    appName.includes('gmail') ||
    integrationId.includes('gmail')
  );
}

export function getGmailEmailAddress(connection: any, fallback?: string): string {
  const candidates = [
    connection?.connectionParams?.email,
    connection?.connectionParams?.emailAddress,
    connection?.data?.email,
    connection?.data?.emailAddress,
    connection?.data?.account_email,
    connection?.data?.profile?.email,
    connection?.profile?.email,
    connection?.alias,
    connection?.wordId,
    fallback,
  ];

  return (
    candidates.find((value) => typeof value === 'string' && value.includes('@')) ||
    connection?.alias ||
    connection?.wordId ||
    'connected-gmail@mailsense.ai'
  );
}

// ----------------------------------------------------
// Database Helpers for Secure Connected Account Storage
// ----------------------------------------------------

export interface GmailConnectionRecord {
  id: string;
  userId: string;
  connectedAccountId: string;
  emailAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save or update connected account details in Supabase
 */
export async function saveGmailConnection(
  userId: string,
  connectedAccountId: string,
  emailAddress: string
): Promise<GmailConnectionRecord> {
  const { data: existing } = await supabase
    .from('gmail_connections')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('gmail_connections')
      .update({
        connected_account_id: connectedAccountId,
        email_address: emailAddress,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) throw new Error(error.message);
    const row = data?.[0];
    return {
      id: row.id,
      userId: row.user_id,
      connectedAccountId: row.connected_account_id,
      emailAddress: row.email_address,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } else {
    const { data, error } = await supabase
      .from('gmail_connections')
      .insert({
        user_id: userId,
        connected_account_id: connectedAccountId,
        email_address: emailAddress,
        status: 'active'
      })
      .select();

    if (error) throw new Error(error.message);
    const row = data?.[0];
    return {
      id: row.id,
      userId: row.user_id,
      connectedAccountId: row.connected_account_id,
      emailAddress: row.email_address,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

/**
 * Fetch connected account details from Supabase
 */
export async function getGmailConnection(userId: string): Promise<GmailConnectionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('gmail_connections')
      .select('id, user_id, connected_account_id, email_address, status, created_at, updated_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      return {
        id: data.id,
        userId: data.user_id,
        connectedAccountId: data.connected_account_id,
        emailAddress: data.email_address,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
  } catch (error) {
    console.error('Failed to get Gmail connection from DB:', error);
  }
  return null;
}

/**
 * Remove/Disconnect connection in Supabase
 */
export async function deleteGmailConnection(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('gmail_connections')
    .update({
      status: 'disconnected',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  return !error;
}

// ----------------------------------------------------
// Email Text Cleaning Helper
// ----------------------------------------------------

/**
 * Clean HTML markup into readable plain text while keeping structure
 */
export function cleanHtml(html: string): string {
  if (!html) return '';
  
  let text = html;
  
  // 1. Remove style/script block tags
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // 2. Format structure with line breaks
  text = text.replace(/<tr[^>]*>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  
  // 3. Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // 4. Decode HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  text = text.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match);
  
  // 5. Clean up duplicate linebreaks and spaces
  text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  return text.trim();
}

// ----------------------------------------------------
// Email Normalizer and Payload Parsers
// ----------------------------------------------------

function getHeader(headers: any[], name: string): string {
  if (!headers || !Array.isArray(headers)) return '';
  const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
  return header ? header.value || '' : '';
}

function getBodyText(payload: any): { plain: string; html: string } {
  let plain = '';
  let html = '';
  
  if (!payload) return { plain, html };
  
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    const rawData = payload.body.data;
    const normalized = rawData.replace(/-/g, '+').replace(/_/g, '/');
    plain = Buffer.from(normalized, 'base64').toString('utf8');
  } else if (payload.mimeType === 'text/html' && payload.body?.data) {
    const rawData = payload.body.data;
    const normalized = rawData.replace(/-/g, '+').replace(/_/g, '/');
    html = Buffer.from(normalized, 'base64').toString('utf8');
  }
  
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const partBody = getBodyText(part);
      if (partBody.plain) plain += (plain ? '\n' : '') + partBody.plain;
      if (partBody.html) html += (html ? '\n' : '') + partBody.html;
    }
  }
  
  return { plain, html };
}

function getAttachmentsMetadata(parts: any[]): any[] {
  const attachments: any[] = [];
  if (!parts || !Array.isArray(parts)) return attachments;
  
  for (const part of parts) {
    if (part.filename && (part.body?.attachmentId || part.body?.size > 0)) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId || ''
      });
    }
    if (part.parts) {
      attachments.push(...getAttachmentsMetadata(part.parts));
    }
  }
  return attachments;
}

/**
 * Normalizes email response objects from Gmail API / Composio Action executions
 */
export function normalizeEmail(msg: any): any {
  if (!msg) return null;
  
  let id = msg.id || msg.messageId || '';
  let threadId = msg.threadId || '';
  let subject = msg.subject || '';
  let body = msg.body || msg.text || '';
  let sender = msg.sender || msg.from || '';
  let recipients: string[] = [];
  let date = msg.date || msg.timestamp || new Date().toISOString();
  let snippet = msg.snippet || msg.preview || '';
  let labels: string[] = msg.labels || msg.labelIds || [];
  let attachments: any[] = msg.attachments || [];
  let isRead = msg.isRead !== undefined ? msg.isRead : !labels.includes('UNREAD');
  
  if (msg.to) {
    recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
  }
  
  // Parse payload-based structure (raw Gmail payload)
  if (msg.payload) {
    const headers = msg.payload.headers || [];
    subject = subject || getHeader(headers, 'Subject');
    sender = sender || getHeader(headers, 'From');
    
    const toStr = getHeader(headers, 'To');
    const ccStr = getHeader(headers, 'Cc');
    const recips = [
      ...toStr.split(',').map((s: string) => s.trim()).filter(Boolean),
      ...ccStr.split(',').map((s: string) => s.trim()).filter(Boolean)
    ];
    if (recipients.length === 0) {
      recipients = recips;
    }
    
    date = date || getHeader(headers, 'Date');
    
    const parsedBody = getBodyText(msg.payload);
    if (!body) {
      if (parsedBody.plain) {
        body = parsedBody.plain;
      } else if (parsedBody.html) {
        body = cleanHtml(parsedBody.html);
      }
    }
    
    if (msg.payload.parts) {
      attachments = getAttachmentsMetadata(msg.payload.parts);
    }
  }
  
  if (msg.html && !body) {
    body = cleanHtml(msg.html);
  }
  
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      date = d.toISOString();
    }
  } catch (e) {}
  
  return {
    id,
    threadId,
    subject: subject || '(No Subject)',
    body: body || snippet || '(No Content)',
    sender: sender || '(No Sender)',
    recipients,
    date,
    snippet: snippet || (body ? body.substring(0, 100) : '(No Content)'),
    labels,
    attachments,
    isRead
  };
}
