import { NextResponse } from 'next/server';
import { getComposioClient, getGmailConnection, getGmailUserSession } from '@/lib/composio';

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

    // 1. Check if Gmail is connected
    const conn = await getGmailConnection(userId);
    if (!conn) {
      return NextResponse.json(
        { error: 'Gmail is not connected. Please connect your Gmail account.' },
        { status: 401 }
      );
    }

    const composio = getComposioClient();

    // 2. Call Composio action to create draft
    const response = await composio.tools.execute('GMAIL_CREATE_EMAIL_DRAFT', {
      userId,
      dangerouslySkipVersionCheck: true,
      arguments: {
        recipient_email: to,
        subject: subject,
        body: emailBody,
        thread_id: threadId || undefined,
        threadId: threadId || undefined,
      },
    });

    if (!response || !response.successful) {
      return NextResponse.json(
        { error: response?.error || 'Failed to create draft in Gmail' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: response.data,
    });

  } catch (error: any) {
    console.error('Failed to create Gmail draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft', details: error.message },
      { status: 500 }
    );
  }
}
