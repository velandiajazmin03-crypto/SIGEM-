import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';
import { getSessionUser } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de equipo inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const equipo = await db.getEquipoById(id);

    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(equipo);
  } catch (e) {
    console.error('Error fetching equipo:', e);
    return NextResponse.json({ error: 'Error al obtener el equipo.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de equipo inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDb();

    // Validar si existe el equipo
    const existente = await db.getEquipoById(id);
    if (!existente) {
      return NextResponse.json({ error: 'Equipo no encontrado.' }, { status: 404 });
    }

    // Validar duplicados si se modifica código o serial
    const equipos = await db.getEquipos();
    if (body.codigo_inventario && body.codigo_inventario !== existente.codigo_inventario) {
      const duplicado = equipos.some(
        (e) => e.id !== id && e.codigo_inventario.toLowerCase() === body.codigo_inventario.toLowerCase()
      );
      if (duplicado) {
        return NextResponse.json(
          { error: 'El código de inventario ya se encuentra registrado por otro equipo.' },
          { status: 400 }
        );
      }
    }
    if (body.serial && body.serial !== existente.serial) {
      const duplicado = equipos.some(
        (e) => e.id !== id && e.serial.toLowerCase() === body.serial.toLowerCase()
      );
      if (duplicado) {
        return NextResponse.json(
          { error: 'El número de serial ya se encuentra registrado por otro equipo.' },
          { status: 400 }
        );
      }
    }

    const actualizado = await db.updateEquipo(id, body);
    return NextResponse.json(actualizado);
  } catch (e) {
    console.error('Error updating equipo:', e);
    return NextResponse.json({ error: 'Error al actualizar el equipo.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const sessionUser = getSessionUser(request);
    if (!sessionUser || sessionUser.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Solo un administrador puede eliminar equipos del inventario.' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de equipo inválido.' }, { status: 400 });
    }

    const db = await getDb();
    const eliminado = await db.deleteEquipo(id);

    if (!eliminado) {
      return NextResponse.json({ error: 'Equipo no encontrado o no pudo eliminarse.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Equipo eliminado con éxito.' });
  } catch (e) {
    console.error('Error deleting equipo:', e);
    return NextResponse.json({ error: 'Error al eliminar el equipo.' }, { status: 500 });
  }
}
