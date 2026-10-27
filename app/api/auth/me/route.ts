import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.delete('session_token');
    return response;
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.id,
      username: payload.username,
      nombre: payload.nombre,
      rol: payload.rol,
    },
  });
}
