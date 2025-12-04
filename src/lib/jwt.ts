import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_PASSWORD || 'fallback-secret-key';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  authenticated: boolean;
  iat?: number;
  exp?: number;
}

export function generateToken(): string {
  const payload: JWTPayload = {
    authenticated: true,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
