import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  try {
    console.log('Transcription request received');

    // Validate authentication
    if (!validateAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid authentication' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const accessToken = formData.get('accessToken') as string;
    const language = (formData.get('language') as string) || 'english';

    console.log('File received:', audioFile?.name, `(${audioFile?.size} bytes)`);
    console.log('Access token length:', accessToken ? accessToken.length : 0);
    console.log('Language:', language);

    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      console.error('No access token provided');
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 400 }
      );
    }

    console.log('Preparing request to Salesforce transcription API');

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create form data for Salesforce API
    const salesforceFormData = new FormData();
    salesforceFormData.append('input', buffer, {
      filename: audioFile.name,
      contentType: audioFile.type,
    });
    salesforceFormData.append('engine', 'internal');
    salesforceFormData.append('language', language);

    console.log('Making request to Salesforce API');

    // Make request to Salesforce transcription API
    const response = await fetch(
      'https://api.salesforce.com/einstein/platform/v1/models/transcribeInternalV1/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-sfdc-app-context': 'EinsteinGPT',
          'x-client-feature-id': 'external-edc',
          ...salesforceFormData.getHeaders(),
        },
        body: salesforceFormData as any,
      }
    );

    console.log('Salesforce API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce API error:', response.status, errorText);
      return NextResponse.json(
        {
          error: `Salesforce API error: ${response.status} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Transcription successful:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in transcription function:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Increase the body size limit for audio files
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
