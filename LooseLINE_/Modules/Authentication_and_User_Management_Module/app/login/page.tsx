'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 🔴 ВАЖНО: тот же список что и в других файлах!
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : ['admin@example.com'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Отправка запроса на вход для:', email);

      // 🔴 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: используем callbackURL на страницу проверки роли
      const requestBody = {
        email,
        password,
        callbackURL: '/auth/redirect' // Перенаправляем на страницу проверки роли
      };

      console.log('📤 Тело запроса:', requestBody);

      // Пробуем оба возможных пути Better-auth
      const pathsToTry = [
        '/api/auth/sign-in/email',
        '/api/auth/signin/email'
      ];

      let response;
      let responseData;

      for (const path of pathsToTry) {
        try {
          console.log(`🔄 Пробуем путь: ${path}`);
          response = await fetch(path, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include' // Важно для cookies
          });

          console.log(`📥 Ответ от ${path}: статус ${response.status}`);

          if (response.status !== 404) {
            const text = await response.text();
            console.log(`📄 Ответ текст:`, text);

            if (text) {
              try {
                responseData = JSON.parse(text);
                console.log(`✅ JSON парсинг успешен:`, responseData);
              } catch (parseError) {
                console.log(`❌ Ответ не JSON`);
                responseData = { message: text };
              }
            }
            break; // если путь работает, выходим из цикла
          }
        } catch (err) {
          console.log(`❌ Ошибка пути ${path}:`, err);
        }
      }

      if (!response) {
        throw new Error('Все пути аутентификации не работают. Проверьте настройки Better-auth.');
      }

      if (response.ok) {
        console.log('✅ Вход успешен!');
        console.log('📊 Данные ответа:', responseData);

        // 🔴 ПРОВЕРЯЕМ РОЛЬ ПОЛЬЗОВАТЕЛЯ СРАЗУ ПОСЛЕ ВХОДА
        const userEmail = email.toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(userEmail);

        console.log(`👤 Email пользователя: ${userEmail}`);
        console.log(`👑 Админ emails: ${ADMIN_EMAILS}`);
        console.log(`🔐 Является админом: ${isAdmin}`);

        if (isAdmin) {
          console.log(`🚀 ${userEmail} - АДМИН! Редирект в админ-панель...`);
          // Даем время для установки сессии
          setTimeout(() => {
            router.push('/admin');
            router.refresh();
          }, 300);
        } else {
          console.log(`👤 ${userEmail} - обычный пользователь. Редирект в кабинет...`);
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 300);
        }

      } else {
        const errorMsg = responseData?.error?.message ||
          responseData?.message ||
          responseData?.error ||
          `Ошибка входа (${response.status})`;

        console.log('❌ Ошибка входа:', errorMsg);
        console.log('📄 Полный ответ:', responseData);

        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('🔥 Неожиданная ошибка:', err);
      setError(err.message || 'Ошибка сервера. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-5">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔐 Вход в систему
          </h1>
          <p className="text-slate-400 text-sm">
            Или{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              зарегистрируйтесь
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-center gap-3">
              <span className="text-error text-xl">⚠️</span>
              <span className="text-error-foreground text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Email адрес
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-300">
                Пароль
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:text-primary-light transition-colors"
              >
                Забыли пароль?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-primary/40'
              }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}