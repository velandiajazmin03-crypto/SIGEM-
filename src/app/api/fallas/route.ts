import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const fallas = await db.getFallas();
    return NextResponse.json(fallas);
  } catch (e) {
    console.error('Error fetching fallas:', e);
    return NextResponse.json({ error: 'Error al obtener las fallas.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipo_id, descripcion, responsable, estado_reparacion, evidencia_url } = body;

    if (!equipo_id || !descripcion || !responsable) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const db = await getDb();

    // Validar si existe el equipo
    const equipo = await db.getEquipoById(parseInt(equipo_id));
    if (!equipo) {
      return NextResponse.json({ error: 'El equipo especificado no existe.' }, { status: 404 });
    }

    const nuevaFalla = await db.createFalla({
      equipo_id: parseInt(equipo_id),
      descripcion,
      responsable,
      estado_reparacion: estado_reparacion || 'Reportado',
      fecha_reporte: new Date().toISOString(),
      evidencia_url: evidencia_url || null,
    });

    return NextResponse.json(nuevaFalla, { status: 201 });
  } catch (e) {
    console.error('Error creating falla:', e);
    return NextResponse.json({ error: 'Error al registrar la falla.' }, { status: 500 });
  }
}
