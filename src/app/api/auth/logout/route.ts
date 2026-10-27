import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada correctamente.' });
  
  response.cookies.set('session_token', '', {
    httpOnly: true,
    maxAge: 0, // Elimina la cookie inmediatamente
    path: '/',
  });

  return response;
}
