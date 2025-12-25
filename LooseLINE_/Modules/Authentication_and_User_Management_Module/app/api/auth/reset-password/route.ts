// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { Pool } from 'pg';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать не менее 6 символов' },
        { status: 400 }
      );
    }

    // Прямое подключение к БД
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });

    // Проверяем пользователя
    const userResult = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: 'Пользователь с таким email не найден' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const hashedPassword = await hash(password, 12);

    // Обновляем пароль
    await pool.query(
      'UPDATE "user" SET password = $1, "updatedAt" = $2 WHERE id = $3',
      [hashedPassword, new Date(), user.id]
    );

    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно обновлен'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Ошибка при сбросе пароля' },
      { status: 500 }
    );
  }
}