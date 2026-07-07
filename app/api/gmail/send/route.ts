import { NextResponse } from 'next/server';
import { getComposioClient, getGmailConnection, getGmailUserSession } from '@/lib/composio';

// Helper function to extract email from "Name <email>" format
function extractEmail(emailString: string): string {
  const match = emailString.match(/<([^>]+)>/);
  return match ? match[1] : emailString;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, body: emailBody, threadId } = body;
    const { userId } = getGmailUserSession(req);

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'recipient_email (to), subject, and body are required' },
        { status: 400 }
      );
    }

    // Extract clean email address from "Name <email>" format
    const recipientEmail = extractEmail(to);

    // 1. Check if Gmail is connected
    const conn = await getGmailConnection(userId);
    if (!conn) {
      return NextResponse.json(
        { error: 'Gmail is not connected. Please connect your Gmail account.' },
        { status: 401 }
      );
    }

    const composio = getComposioClient();

    // 2. Call Composio action to send message (trying GMAIL_SEND_MESSAGE first)
    let response;
    try {
      response = await composio.tools.execute('GMAIL_SEND_MESSAGE', {
        userId,
        dangerouslySkipVersionCheck: true,
        arguments: {
          recipient_email: recipientEmail,
          subject: subject,
          body: emailBody,
          thread_id: threadId || undefined,
          threadId: threadId || undefined,
        },
      });
    } catch (err: any) {
      console.warn('GMAIL_SEND_MESSAGE failed, trying GMAIL_SEND_EMAIL fallback...', err);
      // Fallback to GMAIL_SEND_EMAIL
      response = await composio.tools.execute('GMAIL_SEND_EMAIL', {
        userId,
        dangerouslySkipVersionCheck: true,
        arguments: {
          recipient_email: recipientEmail,
          subject: subject,
          body: emailBody,
          thread_id: threadId || undefined,
          threadId: threadId || undefined,
        },
      });
    }

    if (!response || !response.successful) {
      return NextResponse.json(
        { error: response?.error || 'Failed to send email through Gmail' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });

  } catch (error: any) {
    console.error('Failed to send Gmail email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
