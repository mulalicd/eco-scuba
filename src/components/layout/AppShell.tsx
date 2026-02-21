import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import TopNav from './TopNav';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const { sidebarOpen, pageTitle } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className={cn(
        'flex flex-col flex-1 overflow-hidden transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        <TopNav title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
