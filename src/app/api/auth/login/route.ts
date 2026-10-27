import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Por favor, ingrese todos los campos.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db.getUsuarioByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    // Firmar el token
    const token = signToken({
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
      },
    });

    // Guardar en cookie segura
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (e) {
    console.error('Error en API login:', e);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
