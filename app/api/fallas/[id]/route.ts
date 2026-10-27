import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de falla inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDb();

    // Validar si existe la falla
    const existente = await db.getFallaById(id);
    if (!existente) {
      return NextResponse.json({ error: 'Falla no encontrada.' }, { status: 404 });
    }

    // Si se resuelve, registrar la fecha de solución
    if (body.estado_reparacion === 'Resuelto' && existente.estado_reparacion !== 'Resuelto') {
      body.fecha_solucion = new Date().toISOString();
    }

    const actualizada = await db.updateFalla(id, body);
    return NextResponse.json(actualizada);
  } catch (e) {
    console.error('Error updating falla:', e);
    return NextResponse.json({ error: 'Error al actualizar la falla.' }, { status: 500 });
  }
}
