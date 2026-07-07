import { NextResponse } from 'next/server';
import {
  getComposioClient,
  getGmailConnection,
  getGmailEmailAddress,
  getGmailUserSession,
  isGmailConnection,
  saveGmailConnection,
  setGmailUserCookie
} from '@/lib/composio';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const connect = searchParams.get('connect') === 'true';
    const session = getGmailUserSession(req);
    const userId = session.userId;
    const requestUrl = new URL(req.url);
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const appBaseUrl = configuredAppUrl && !configuredAppUrl.includes('localhost:3000')
      ? configuredAppUrl
      : requestUrl.origin;

    const composio = getComposioClient();

    // 1. If connect requested, initiate a new connection link
    if (connect) {
      const authConfig = await composio.authConfigs.list({ toolkit: 'gmail' });
      let authConfigId = authConfig.items[0]?.id;
      if (!authConfigId) {
        const newConfig = await composio.authConfigs.create('gmail', {
          type: 'use_composio_managed_auth',
          name: 'Gmail Auth Config',
        });
        authConfigId = newConfig.id;
      }
      const connectionRequest = await composio.connectedAccounts.link(userId, authConfigId, {
        callbackUrl: `${appBaseUrl}/dashboard/connectors`,
      });

      const response = NextResponse.json({
        connected: false,
        url: connectionRequest.redirectUrl,
        connectedAccountId: connectionRequest.id,
      });
      setGmailUserCookie(response, session);
      return response;
    }

    // 2. Otherwise, check existing connection status.
    // Composio's SDK can throw for a brand-new entity with no accounts; treat that
    // as disconnected and let the stored DB record be the fallback.
    let activeConnections: any = { items: [] };
    try {
      activeConnections = await composio.connectedAccounts.list({
        userIds: [userId],
        toolkitSlugs: ['gmail'],
        statuses: ['ACTIVE'],
      });
    } catch (listError) {
      console.warn('Unable to list Composio Gmail connections:', listError);
    }

    const gmailConnection = activeConnections.items?.find(isGmailConnection);

    if (gmailConnection) {
      const existing = await getGmailConnection(userId);
      const emailAddress = getGmailEmailAddress(gmailConnection, existing?.emailAddress);

      await saveGmailConnection(userId, gmailConnection.id, emailAddress);

      const response = NextResponse.json({
        connected: true,
        email: emailAddress,
        connectedAccountId: gmailConnection.id,
      });
      setGmailUserCookie(response, session);
      return response;
    }

    // Check Supabase status
    const dbConnection = await getGmailConnection(userId);
    if (dbConnection && dbConnection.status === 'active') {
      const response = NextResponse.json({
        connected: true,
        email: dbConnection.emailAddress,
        connectedAccountId: dbConnection.connectedAccountId,
      });
      setGmailUserCookie(response, session);
      return response;
    }

    const response = NextResponse.json({
      connected: false,
      email: null,
    });
    setGmailUserCookie(response, session);
    return response;

  } catch (error: any) {
    console.error('Failed to retrieve Gmail status:', error);
    const details = error instanceof Error ? error.message : 'Unknown Gmail status error';
    return NextResponse.json(
      { error: 'Failed to retrieve Gmail status', details },
      { status: 500 }
    );
  }
}
