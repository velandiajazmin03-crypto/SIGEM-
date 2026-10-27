import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const stats = await db.getDashboardStats();
    return NextResponse.json(stats);
  } catch (e) {
    console.error('Error fetching dashboard stats:', e);
    return NextResponse.json({ error: 'Error al obtener estadísticas.' }, { status: 500 });
  }
}
