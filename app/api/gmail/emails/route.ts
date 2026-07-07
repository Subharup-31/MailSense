import { NextResponse } from 'next/server';
import { getComposioClient, getGmailConnection, getGmailUserSession, normalizeEmail } from '@/lib/composio';

export async function GET(req: Request) {
  try {
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

    // 2. Fetch recent emails using Composio
    const response = await composio.tools.execute('GMAIL_FETCH_EMAILS', {
      userId,
      dangerouslySkipVersionCheck: true,
      arguments: {
        max_results: 15,
      },
    });

    // 3. Extract and parse messages dynamically
    let rawEmails: any[] = [];
    if (response && response.successful && response.data) {
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
    } else if (response && Array.isArray(response)) {
      rawEmails = response;
    }

    const normalizedEmails = rawEmails.map(normalizeEmail).filter(Boolean);

    return NextResponse.json({
      emails: normalizedEmails,
    });

  } catch (error: any) {
    console.error('Failed to fetch Gmail emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails', details: error.message },
      { status: 500 }
    );
  }
}
