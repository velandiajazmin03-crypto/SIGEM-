import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const equipoId = parseInt(params.id);
    if (isNaN(equipoId)) {
      return NextResponse.json({ error: 'ID de equipo inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const mantenimientos = await db.getMantenimientosByEquipo(equipoId);
    return NextResponse.json(mantenimientos);
  } catch (e) {
    console.error('Error fetching mantenimientos:', e);
    return NextResponse.json({ error: 'Error al obtener los mantenimientos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const equipoId = parseInt(params.id);
    if (isNaN(equipoId)) {
      return NextResponse.json({ error: 'ID de equipo inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const { tipo, descripcion, responsable, costo, documento_url } = body;

    if (!tipo || !descripcion || !responsable) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const db = await getDb();

    // Validar si existe el equipo
    const equipo = await db.getEquipoById(equipoId);
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado.' }, { status: 404 });
    }

    const nuevoMantenimiento = await db.createMantenimiento({
      equipo_id: equipoId,
      tipo,
      descripcion,
      responsable,
      costo: parseFloat(costo || 0),
      fecha_mantenimiento: new Date().toISOString(),
      documento_url: documento_url || null,
    });

    // Si es correctivo y solucionó alguna falla, o simplemente actualiza el estado del equipo si se especifica
    if (body.actualizar_estado_equipo) {
      await db.updateEquipo(equipoId, { estado: body.actualizar_estado_equipo });
    }

    return NextResponse.json(nuevoMantenimiento, { status: 201 });
  } catch (e) {
    console.error('Error creating mantenimiento:', e);
    return NextResponse.json({ error: 'Error al registrar el mantenimiento.' }, { status: 500 });
  }
}
