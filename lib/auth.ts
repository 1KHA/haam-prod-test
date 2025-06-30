import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

// Define UserRole enum (should match the one in Prisma schema)
export enum UserRole {
  ADMIN = 'ADMIN',
  PROGRAM_MANAGER = 'PROGRAM_MANAGER',
  MENTOR = 'MENTOR',
  INVESTOR = 'INVESTOR',
  JUDGE = 'JUDGE',
  PARTICIPANT = 'PARTICIPANT',
  ENTREPRENEUR = 'ENTREPRENEUR'
}

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

// Get token from request headers
export function getTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

// Middleware to check if user is authenticated
export async function isAuthenticated(authHeader?: string): Promise<TokenPayload | null> {
  console.log('[AUTH] Incoming Authorization header:', authHeader);
  const token = getTokenFromHeader(authHeader);
  console.log('[AUTH] Extracted token:', token);
  if (!token) {
    console.log('[AUTH] No token found in header.');
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
