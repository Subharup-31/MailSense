export const CATEGORIES = [
  'Customer Support',
  'Scheduling',
  'Recruitment',
  'HR',
  'Finance',
  'Internal Communication',
  'Technical Support',
  'Sales',
  'Marketing',
  'Legal',
  'Vendors',
  'Management',
  'Meetings',
  'Project Updates',
  'Follow Ups',
  'Invoices',
  'Refunds',
  'Complaints',
  'Job Applications',
  'Announcements'
] as const;

export type EmailCategory = typeof CATEGORIES[number];

export interface RawEmailInput {
  subject: string;
  body: string;
  reply?: string;
  category: EmailCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tone: 'Professional' | 'Friendly' | 'Direct' | 'Empathetic';
}

/**
 * Remove HTML tags from text.
 */
export function cleanHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove common email signatures.
 */
export function cleanSignature(text: string): string {
  if (!text) return '';
  
  // Common signature splitters (regex)
  const signaturePatterns = [
    /^(thanks|regards|best regards|kind regards|sincerely|cheers|best|warmly|respectfully|thank you|yours truly),?\s*$/im,
    /^--\s*$/m, // Standard signature delimiter
    /^__+\s*$/m,
    /^sent from my (iphone|android|ipad|blackberry|mobile device|phone|mail client)/im
  ];

  const lines = text.split('\n');
  let cutIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const pattern of signaturePatterns) {
      if (pattern.test(line)) {
        cutIndex = i;
        break;
      }
    }
    if (cutIndex !== lines.length) {
      break;
    }
  }

  return lines.slice(0, cutIndex).join('\n').trim();
}

/**
 * Remove duplicates from an array of strings/objects based on normalized similarity.
 */
export function deduplicateEmails<T>(
  items: T[],
  getText: (item: T) => string
): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = getText(item)
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Split long email threads on standard indicators (like "From:", "On ... wrote:").
 * Returns the most recent message.
 */
export function splitEmailThread(text: string): string {
  if (!text) return '';
  
  const threadIndicators = [
    /-----Original Message-----/i,
    /________________________________/i,
    /From:.*@/i,
    /On\s+.*wrote:/i,
    /On\s+.*at\s+.*wrote:/i,
    /Begin forwarded message:/i
  ];

  const lines = text.split('\n');
  let cutIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const indicator of threadIndicators) {
      if (indicator.test(line)) {
        cutIndex = i;
        break;
      }
    }
    if (cutIndex !== lines.length) {
      break;
    }
  }

  return lines.slice(0, cutIndex).join('\n').trim();
}
