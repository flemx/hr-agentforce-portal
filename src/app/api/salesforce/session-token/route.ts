import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    if (!validateAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid authentication' },
        { status: 401 }
      );
    }

    const instanceUrl = process.env.NEXT_PUBLIC_SALESFORCE_INSTANCE_URL;
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

    if (!instanceUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing Salesforce configuration. Please check environment variables.' },
        { status: 500 }
      );
    }

    const tokenUrl = `${instanceUrl}/services/oauth2/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }

    // console.log('Salesforce token request :', tokenUrl,  requestOptions);

    const response = await fetch(tokenUrl, requestOptions);

    const data = await response.json();
    // console.log('Salesforce token response data:', response.status, data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Salesforce token request failed',
          status: response.status,
          details: data.error || data.error_description || 'Unknown error',
        },
        { status: response.status }
      );
    }

    if (!data.access_token) {
      return NextResponse.json(
        { error: 'No access_token in Salesforce response' },
        { status: 502 }
      );
    }
    console.log('Salesforce token response:', data);
    return NextResponse.json({
      session_token: data.access_token,
    });
  } catch (e) {
    console.error('Error in session-token:', e);
    return NextResponse.json(
      {
        error: 'Unexpected error',
        message: String(e),
      },
      { status: 500 }
    );
  }
}

// Also support GET for convenience
export async function GET(request: NextRequest) {
  return POST(request);
}
