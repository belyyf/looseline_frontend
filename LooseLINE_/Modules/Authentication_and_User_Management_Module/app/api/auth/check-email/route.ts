// app/api/auth/check-email/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db
      .selectFrom('user')
      .select('id')
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    return NextResponse.json({ exists: !!user });

  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}