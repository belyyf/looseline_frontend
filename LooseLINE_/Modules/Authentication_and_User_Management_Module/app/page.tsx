// app/page.tsx
'use client';

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans">
      {/* Hero Section */}
      <div className="relative py-20 px-5 text-center overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary-light text-sm font-medium tracking-wide animate-fade-in-up">
            🚀 BETTING PLATFORM OF THE NEXT GENERATION
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-info-light to-primary-dark animate-fade-in-up delay-100">
            LooseLine
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
            Современная платформа для ставок на спортивные события.<br />
            Безопасные транзакции, честные коэффициенты и удобный интерфейс для всех ваших ставок.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 animate-fade-in-up delay-300">
            <InteractiveLink
              href="/login"
              variant="primary"
              emoji="🎯"
              text="Начать делать ставки"
            />

            <InteractiveLink
              href="/register"
              variant="secondary"
              emoji="💰"
              text="Создать аккаунт"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 mt-20 pt-10 border-t border-white/5 animate-fade-in-up delay-500">
            <StatItem number="99.9%" label="Аптайм" />
            <StatItem number="<100мс" label="Скорость ставок" />
            <StatItem number="256-bit" label="Шифрование" />
            <StatItem number="24/7" label="Поддержка" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 px-5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-info-light to-primary-light">
            Почему выбирают LooseLine?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              emoji="🛡️"
              title="Безопасность данных"
              description="Современные технологии шифрования защищают ваши персональные данные и финансовые транзакции. Все операции проходят через защищённые каналы связи."
              colorClass="text-info"
              bgClass="bg-info/10"
              borderClass="border-info/20"
            />

            <FeatureCard
              emoji="⚡"
              title="Быстрые транзакции"
              description="Оперативное пополнение счёта и вывод средств. Все финансовые операции обрабатываются в кратчайшие сроки без лишних задержек."
              colorClass="text-success"
              bgClass="bg-success/10"
              borderClass="border-success/20"
            />

            <FeatureCard
              emoji="📊"
              title="Широкий выбор событий"
              description="Ставки на футбол, баскетбол, теннис, хоккей и другие виды спорта. Актуальные коэффициенты и множество вариантов ставок."
              colorClass="text-warning"
              bgClass="bg-warning/10"
              borderClass="border-warning/20"
            />

            <FeatureCard
              emoji="🎮"
              title="Ставки в реальном времени"
              description="Делайте ставки во время матчей. Следите за событиями в прямом эфире и реагируйте на изменения в игре."
              colorClass="text-live"
              bgClass="bg-live/10"
              borderClass="border-live/20"
            />

            <FeatureCard
              emoji="📱"
              title="Удобство использования"
              description="Интуитивно понятный интерфейс работает на всех устройствах. Делайте ставки с компьютера, планшета или смартфона."
              colorClass="text-primary-light"
              bgClass="bg-primary/10"
              borderClass="border-primary/20"
            />

            <FeatureCard
              emoji="🔒"
              title="Честные коэффициенты"
              description="Прозрачная система расчёта коэффициентов. Все ставки обрабатываются справедливо и в соответствии с правилами платформы."
              colorClass="text-error"
              bgClass="bg-error/10"
              borderClass="border-error/20"
            />
          </div>
        </div>
      </section>

      {/* Auth Status Section */}
      <section className="py-24 px-5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto bg-slate-800/50 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-white/10 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            <span className="text-primary">Система</span> аутентификации
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <StatusItem
              emoji="✅"
              title="Безопасный вход"
              status="Активен"
              description="BetterAuth с 2FA"
              statusColor="text-success"
            />

            <StatusItem
              emoji="✅"
              title="Регистрация"
              status="Доступна"
              description="Менее 30 секунд"
              statusColor="text-success"
            />

            <StatusItem
              emoji="🔐"
              title="Шифрование"
              status="256-bit"
              description="Банковский уровень"
              statusColor="text-info"
            />

            <StatusItem
              emoji="⚡"
              title="Скорость API"
              status="<50мс"
              description="Мгновенный ответ"
              statusColor="text-warning"
            />
          </div>

          <div className="text-center mt-16 pt-10 border-t border-white/10">
            <p className="text-slate-400 text-lg mb-8">
              Начните делать ставки уже сегодня. Регистрация занимает всего несколько минут
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl shadow-lg hover:shadow-primary/50 transform hover:-translate-y-1 transition-all duration-300"
            >
              🚀 Начать бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-5 bg-slate-950 border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-4xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-info">
            LooseLine
          </div>

          <p className="text-slate-500 mb-10 max-w-2xl mx-auto">
            © 2024 LooseLine Betting Platform. Все права защищены.<br />
            Ответственная игра. Только для лиц старше 18 лет.
          </p>

          <div className="flex justify-center gap-8 flex-wrap mb-10 text-slate-600 text-sm font-medium">
            <span>Licensed & Regulated</span>
            <span>SSL Secured</span>
            <span>Responsible Gaming</span>
            <span>24/7 Support</span>
          </div>

          <div className="text-slate-700 text-xs font-mono">
            Next.js • BetterAuth • TypeScript • Secure Infrastructure
          </div>
        </div>
      </footer>
    </div>
  );
}

// Components

function InteractiveLink({
  href,
  variant,
  emoji,
  text
}: {
  href: string;
  variant: "primary" | "secondary";
  emoji: string;
  text: string;
}) {
  const isPrimary = variant === "primary";

  const baseClasses = "flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-lg font-bold min-w-[260px] transition-all duration-300 transform hover:-translate-y-1 ease-out";
  const variantClasses = isPrimary
    ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg hover:shadow-primary/40"
    : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-indigo-500/40";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="text-2xl">{emoji}</span>
      {text}
    </Link>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center group">
      <div className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 group-hover:from-primary-light group-hover:to-primary transition-all duration-500">
        {number}
      </div>
      <div className="text-slate-400 font-medium tracking-wide text-sm md:text-base uppercase">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
  colorClass,
  bgClass,
  borderClass
}: {
  emoji: string;
  title: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}) {
  return (
    <div
      className={`p-8 rounded-2xl bg-slate-800/40 backdrop-blur-sm border ${borderClass} hover:bg-slate-800 hover:border-opacity-100 transition-all duration-300 group hover:-translate-y-2 hover:shadow-xl`}
    >
      <div className={`text-4xl mb-6 inline-flex p-3 rounded-2xl ${bgClass} ${borderClass} border`}>
        {emoji}
      </div>
      <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary-light transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
        {description}
      </p>
    </div>
  );
}

function StatusItem({
  emoji,
  title,
  status,
  description,
  statusColor
}: {
  emoji: string;
  title: string;
  status: string;
  description: string;
  statusColor: string;
}) {
  return (
    <div className="p-4 rounded-xl hover:bg-white/5 transition-colors">
      <div className="text-4xl mb-4 grayscale hover:grayscale-0 transition-all duration-300">
        {emoji}
      </div>
      <h3 className="text-lg font-bold mb-2 text-white">
        {title}
      </h3>
      <div className={`text-2xl font-black mb-2 ${statusColor}`}>
        {status}
      </div>
      <p className="text-sm text-slate-400 font-medium">
        {description}
      </p>
    </div>
  );
}