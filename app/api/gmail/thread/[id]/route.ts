import { NextResponse } from 'next/server';
import { getComposioClient, getGmailConnection, getGmailUserSession, normalizeEmail } from '@/lib/composio';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { userId } = getGmailUserSession(req);

    // 1. Check if Gmail is connected
    const conn = await getGmailConnection(userId);
    if (!conn) {
      return NextResponse.json(
        { error: 'Gmail is not connected. Please connect your Gmail account.' },
        { status: 401 }
      );
    }

    const composio = getComposioClient();

    // 2. Fetch thread messages using Composio
    const response = await composio.tools.execute('GMAIL_FETCH_MESSAGE_BY_THREAD_ID', {
      userId,
      dangerouslySkipVersionCheck: true,
      arguments: {
        thread_id: id,
        id: id,
      },
    });

    if (!response || !response.successful || !response.data) {
      return NextResponse.json(
        { error: 'Failed to retrieve email thread from Gmail' },
        { status: 404 }
      );
    }

    // 3. Extract and normalize the messages in the thread
    let rawEmails: any[] = [];
    const data = response.data as any;
    if (data && data.response_data) {
      if (Array.isArray(data.response_data.messages)) {
        rawEmails = data.response_data.messages;
      } else if (Array.isArray(data.response_data)) {
        rawEmails = data.response_data;
      }
    } else if (Array.isArray(data.messages)) {
      rawEmails = data.messages;
    } else if (Array.isArray(data)) {
      rawEmails = data;
    }

    const normalizedEmails = rawEmails.map(normalizeEmail).filter(Boolean);

    return NextResponse.json({
      threadId: id,
      emails: normalizedEmails,
    });

  } catch (error: any) {
    console.error('Failed to fetch Gmail thread details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread details', details: error.message },
      { status: 500 }
    );
  }
}
