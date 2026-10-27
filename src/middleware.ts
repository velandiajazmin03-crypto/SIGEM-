import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SECRET = process.env.JWT_SECRET || 'institucion_educativa_secreto_key_2026_antigravity_token';

// Función para verificar firma HMAC usando Web Crypto API (compatible con Edge/Middleware)
async function verifyTokenEdge(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [dataBase64, signature] = parts;
    const dataStr = atob(dataBase64); // decodificar base64 en Edge runtime
    
    // Validar expiración primero
    const payload = JSON.parse(dataStr);
    if (payload.expires < Date.now()) return null;

    // Verificar firma HMAC SHA-256
    const encoder = new TextEncoder();
    const keyBuf = encoder.encode(SECRET);
    const dataBuf = encoder.encode(dataStr);

    const key = await crypto.subtle.importKey(
      'raw',
      keyBuf,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convertir firma hex a ArrayBuffer
    const sigArray = new Uint8Array(
      signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify('HMAC', key, sigArray, dataBuf);
    if (!isValid) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Obtener cookie del token de sesión
  const token = request.cookies.get('session_token')?.value;

  // Si intentamos acceder al admin
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const session = await verifyTokenEdge(token);
    if (!session) {
      // Token inválido o expirado, limpiar y redirigir
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session_token');
      return response;
    }
    return NextResponse.next();
  }

  // Si ya tiene sesión activa y va a login, redirigir a dashboard
  if (path === '/login') {
    if (token) {
      const session = await verifyTokenEdge(token);
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas activan el middleware
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
