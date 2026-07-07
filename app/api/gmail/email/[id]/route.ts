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

    // 2. Fetch specific email using Composio
    const response = await composio.tools.execute('GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID', {
      userId,
      dangerouslySkipVersionCheck: true,
      arguments: {
        id: id,
        message_id: id,
      },
    });

    if (!response || !response.successful || !response.data) {
      return NextResponse.json(
        { error: 'Failed to retrieve email details from Gmail' },
        { status: 404 }
      );
    }

    // 3. Extract and normalize the message
    let rawEmail: any = response.data;
    if (response.data && (response.data as any).response_data) {
      rawEmail = (response.data as any).response_data;
    }

    const normalizedEmail = normalizeEmail(rawEmail);
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Failed to parse email message payload' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      email: normalizedEmail,
    });

  } catch (error: any) {
    console.error('Failed to fetch Gmail email details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email details', details: error.message },
      { status: 500 }
    );
  }
}
