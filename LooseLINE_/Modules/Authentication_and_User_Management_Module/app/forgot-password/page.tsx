// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 - ввод email, 2 - ввод нового пароля
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Проверяем существование email
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2); // Переходим к вводу нового пароля
      } else {
        setError(data.error || 'Пользователь с таким email не найден');
      }
    } catch (err) {
      setError('Произошла ошибка. Пожалуйста, попробуйте снова.');
      console.error('Email check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Пароль успешно изменен! Вы будете перенаправлены на страницу входа...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Произошла ошибка при смене пароля');
      }
    } catch (err) {
      setError('Произошла ошибка. Пожалуйста, попробуйте снова.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-5">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? 'Восстановление пароля' : 'Новый пароль'}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 1
              ? 'Введите email, указанный при регистрации'
              : 'Придумайте новый пароль для вашего аккаунта'}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-center gap-3 mb-5">
            <span className="text-error text-xl">⚠️</span>
            <span className="text-error-foreground text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3 mb-5">
            <span className="text-success text-xl">✅</span>
            <span className="text-success-foreground text-sm font-medium">{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Email адрес
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-primary/40'
                  }`}
              >
                {loading ? 'Проверка...' : 'Далее'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Новый пароль
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Не менее 6 символов"
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-primary/40'
                }`}
            >
              {loading ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
          </form>
        )}

        <div className="text-center pt-6">
          {step === 1 ? (
            <Link
              href="/login"
              className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              ← Вернуться ко входу
            </Link>
          ) : (
            <button
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="bg-transparent border-none text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer w-full"
            >
              ← Назад
            </button>
          )}
        </div>
      </div>
    </div>
  );
}