import { NextResponse } from 'next/server';
import { getComposioClient, getGmailConnection, deleteGmailConnection, getGmailUserSession } from '@/lib/composio';

export async function DELETE(req: Request) {
  try {
    const { userId } = getGmailUserSession(req);

    // 1. Fetch current active connection from DB
    const conn = await getGmailConnection(userId);
    if (!conn) {
      return NextResponse.json({
        success: true,
        message: 'No active Gmail connection found to disconnect.',
      });
    }

    const composio = getComposioClient();

    // 2. Delete the connection in Composio
    try {
      await composio.connectedAccounts.delete(conn.connectedAccountId);
    } catch (apiError: any) {
      console.warn('Composio API connection deletion failed or was already deleted:', apiError);
    }

    // 3. Mark disconnected in database
    await deleteGmailConnection(userId);

    return NextResponse.json({
      success: true,
      message: 'Gmail disconnected successfully.',
    });

  } catch (error: any) {
    console.error('Failed to disconnect Gmail:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Gmail', details: error.message },
      { status: 500 }
    );
  }
}
