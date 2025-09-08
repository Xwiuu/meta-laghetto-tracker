import { ReactNode } from 'react';

const Sidebar = () => (
  <aside className="w-64 bg-gray-100 p-6 h-screen">
    <h2 className="text-xl font-bold">Laghetto Ads Tracker</h2>
    {/* Links de navegação virão aqui */}
  </aside>
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}