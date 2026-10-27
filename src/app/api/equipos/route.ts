import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const equipos = await db.getEquipos();
    return NextResponse.json(equipos);
  } catch (e) {
    console.error('Error fetching equipos:', e);
    return NextResponse.json({ error: 'Error al obtener los equipos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      codigo_inventario,
      nombre,
      marca,
      modelo,
      serial,
      procesador,
      ram,
      disco_duro,
      sistema_operativo,
      estado,
      ubicacion,
      observaciones,
      foto_url,
    } = body;

    // Validar campos obligatorios
    if (
      !codigo_inventario ||
      !nombre ||
      !marca ||
      !modelo ||
      !serial ||
      !procesador ||
      !ram ||
      !disco_duro ||
      !sistema_operativo ||
      !estado ||
      !ubicacion
    ) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const db = await getDb();

    // Validar si el código de inventario o el serial ya existen
    const equipos = await db.getEquipos();
    const duplicadoCodigo = equipos.some(
      (e) => e.codigo_inventario.toLowerCase() === codigo_inventario.toLowerCase()
    );
    const duplicadoSerial = equipos.some(
      (e) => e.serial.toLowerCase() === serial.toLowerCase()
    );

    if (duplicadoCodigo) {
      return NextResponse.json(
        { error: 'El código de inventario ya se encuentra registrado.' },
        { status: 400 }
      );
    }
    if (duplicadoSerial) {
      return NextResponse.json(
        { error: 'El número de serial ya se encuentra registrado.' },
        { status: 400 }
      );
    }

    const nuevoEquipo = await db.createEquipo({
      codigo_inventario,
      nombre,
      marca,
      modelo,
      serial,
      procesador,
      ram,
      disco_duro,
      sistema_operativo,
      estado,
      ubicacion,
      observaciones: observaciones || '',
      foto_url: foto_url || null,
    });

    return NextResponse.json(nuevoEquipo, { status: 201 });
  } catch (e) {
    console.error('Error creating equipo:', e);
    return NextResponse.json({ error: 'Error al registrar el equipo.' }, { status: 500 });
  }
}
