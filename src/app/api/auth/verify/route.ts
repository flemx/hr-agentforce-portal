import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (payload && payload.authenticated) {
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
