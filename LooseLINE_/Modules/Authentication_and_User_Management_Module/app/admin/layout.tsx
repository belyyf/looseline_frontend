// app/admin/layout.tsx
import type { Metadata } from 'next';
import { Sidebar } from '@/app/components/Sidebar';

export const metadata: Metadata = {
  title: 'Админ-панель',
  description: 'Панель управления',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Шрифт уже применен в корневом layout, НЕ добавляем снова
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}