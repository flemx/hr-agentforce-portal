import { NextRequest } from 'next/server';

export function validateAuth(request: NextRequest): boolean {
  const authPassword = process.env.AUTH_PASSWORD;

  if (!authPassword) {
    throw new Error('AUTH_PASSWORD not configured');
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  return token === authPassword;
}
