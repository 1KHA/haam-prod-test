import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
// Re-export UserRole from Prisma client (single source of truth)
export { UserRole } from '@prisma/client';
import { UserRole } from '@prisma/client';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Interface for token payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Compare a password with a hash
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Generate a JWT token
export function generateToken(payload: TokenPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify a JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Get token from request headers (legacy fallback)
export function getTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

// Get token from HTTP-only cookie
export function getTokenFromCookie(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    return cookieStore.get('token')?.value || null;
  } catch (error) {
    // Cookies() only works in Server Components/API routes
    return null;
  }
}

// Middleware to check if user is authenticated
// Tries cookie first, then falls back to Authorization header for backward compatibility
export async function isAuthenticated(authHeader?: string): Promise<TokenPayload | null> {
  console.log('[AUTH] Checking authentication...');
  
  // First try to get token from cookie
  let token = getTokenFromCookie();
  
  // Fallback to Authorization header for backward compatibility
  if (!token && authHeader) {
    console.log('[AUTH] No cookie found, checking Authorization header...');
    token = getTokenFromHeader(authHeader);
  }
  
  console.log('[AUTH] Token found:', token ? 'Yes' : 'No');
  
  if (!token) {
    console.log('[AUTH] No token found in cookie or header.');
    return null;
  }
  
  const payload = verifyToken(token);
  console.log('[AUTH] Decoded payload:', payload);
  return payload;
}

// Middleware to check if user has required role
export async function hasRole(authHeader: string | undefined, roles: UserRole[]): Promise<boolean> {
  const user = await isAuthenticated(authHeader);
  if (!user) {
    return false;
  }
  return roles.includes(user.role);
}
