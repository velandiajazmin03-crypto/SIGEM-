import crypto from 'crypto';
import { NextRequest } from 'next/server';

const SECRET = process.env.JWT_SECRET || 'institucion_educativa_secreto_key_2026_antigravity_token';

/**
 * Genera un hash SHA-256 de una contraseña.
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Firma un token de sesión serializando el payload y calculando su firma HMAC SHA-256.
 */
export function signToken(payload: { id: number; username: string; nombre: string; rol: string }, expiresInDays = 7): string {
  const expires = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const data = JSON.stringify({ ...payload, expires });
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  const dataBase64 = Buffer.from(data).toString('base64');
  return `${dataBase64}.${signature}`;
}

/**
 * Verifica la firma y expiración del token de sesión.
 */
export function verifyToken(token: string): { id: number; username: string; nombre: string; rol: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [dataBase64, signature] = parts;
    const dataStr = Buffer.from(dataBase64, 'base64').toString('utf-8');
    
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(dataStr).digest('hex');
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(dataStr);
    if (payload.expires < Date.now()) return null; // Expirado
    
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Extrae y verifica el usuario de sesión a partir de la cookie de una API Route.
 * Uso: para endpoints que deben restringirse por rol (p. ej. solo 'admin').
 */
export function getSessionUser(request: NextRequest): { id: number; username: string; nombre: string; rol: string } | null {
  const token = request.cookies.get('session_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
