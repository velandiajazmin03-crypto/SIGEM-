import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import AdminLayoutClient from '@/components/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = (cookieStore as any).get('session_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token as string);

  if (!user) {
    redirect('/login');
  }

  return (
    <AdminLayoutClient user={user!}>
      {children}
    </AdminLayoutClient>
  );
}
