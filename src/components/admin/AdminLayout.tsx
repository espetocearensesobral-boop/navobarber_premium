import React, { useState } from 'react';
import { NavoHomeView } from './NavoHomeView';
import { ScheduleGrid } from './ScheduleGrid';
import { ServicesManagement } from './ServicesManagement';
import { ProfessionalsManagement } from './ProfessionalsManagement';
import { ClientsManagement } from './ClientsManagement';
import { WaitingQueue } from './WaitingQueue';
import { SettingsManagement } from './SettingsManagement';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Scissors,
  Users,
  UserCheck,
  Settings,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'agenda' 
  | 'queue' 
  | 'servicos' 
  | 'profissionais' 
  | 'clientes' 
  | 'settings';

export const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('agenda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  React.useEffect(() => {
    // Verifica se o usuário logado é admin
    const userStr = localStorage.getItem('barberx_user');
    
    if (!userStr) {
      window.location.href = '/'; // Redireciona para home
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        window.location.href = '/'; // Não é admin
      } else {
        setIsAuthorized(true);
      }
    } catch {
      window.location.href = '/';
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-base">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Bottom Navigation Bar items for mobile
  const bottomBarTabs = [
    { id: 'agenda' as AdminTab, label: 'Agenda', icon: Calendar },
    { id: 'queue' as AdminTab, label: 'Fila', icon: Clock },
    { id: 'dashboard' as AdminTab, label: 'Stats', icon: TrendingUp },
    { id: 'profissionais' as AdminTab, label: 'Time', icon: Users },
  ];

  // All menu items organized into sections for sidebar
  const sidebarSections = [
    {
      title: 'Atendimento & Fila',
      items: [
        { id: 'agenda' as AdminTab, label: 'Agenda & Horários', icon: Calendar },
        { id: 'queue' as AdminTab, label: 'Fila de Espera', icon: Clock, badge: 'Ao vivo' },
      ]
    },
    {
      title: 'Gestão & Equipe',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Dashboard / Métricas', icon: LayoutDashboard },
        { id: 'profissionais' as AdminTab, label: 'Barbeiros / Equipe', icon: Users },
        { id: 'servicos' as AdminTab, label: 'Catálogo de Serviços', icon: Scissors },
        { id: 'clientes' as AdminTab, label: 'Gestão de Clientes', icon: UserCheck },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'settings' as AdminTab, label: 'Configurações', icon: Settings },
      ]
    }
  ];

  const activeTabLabel = sidebarSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Painel Admin';

  return (
    <div className="min-h-screen bg-surface-base text-content-base font-sans antialiased flex flex-col md:flex-row max-w-full overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col shrink-0 bg-surface-card border-r border-border-subtle min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-base text-surface-base font-black text-lg flex items-center justify-center tracking-tighter shadow-md">
              n
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wider text-gold-hover">navo</span>
                <span className="text-[9px] uppercase tracking-widest text-content-muted font-bold bg-surface-card px-1.5 py-0.5 rounded-full border border-border-subtle">Pro</span>
              </div>
              <span className="text-[10px] text-content-muted font-medium block">Painel administrativo</span>
            </div>
          </div>
        </div>

        {/* Shop Status Badge */}
        <div className="p-3 mx-3 my-3 bg-surface-base border border-border-subtle rounded-xl flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-content-base truncate">BarberX Premium</div>
            <div className="text-[10px] text-content-muted">Unidade Principal</div>
          </div>
        </div>

        {/* Sidebar Nav Sections */}
        <nav className="flex-1 px-3 py-2 space-y-5">
          {sidebarSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-content-muted mb-1">
                {section.title}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gold-base/10 text-gold-hover shadow-sm border border-gold-base/30'
                        : 'text-content-muted hover:text-content-base hover:bg-surface-base'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-gold-hover' : 'text-content-muted'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] bg-status-success/20 text-status-success px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-border-subtle text-[11px] text-content-muted text-center">
          BarberX Admin v2.5
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle px-4 py-2.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gold-base text-surface-base font-black text-xs flex items-center justify-center shrink-0 shadow">
            n
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-gold-hover tracking-wider">BarberX</span>
              <span className="text-content-muted text-[10px]">•</span>
              <span className="text-xs text-content-base font-semibold truncate">{activeTabLabel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-surface-base text-gold-hover border border-border-subtle flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all shrink-0"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 w-full max-w-full pb-24 md:pb-8 overflow-x-hidden">
        <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 w-full min-w-0">
          {activeTab === 'dashboard' && (
            <NavoHomeView onNavigateToAgenda={() => setActiveTab('agenda')} />
          )}
          {activeTab === 'agenda' && <ScheduleGrid />}
          {activeTab === 'queue' && <WaitingQueue />}
          {activeTab === 'servicos' && <ServicesManagement />}
          {activeTab === 'profissionais' && <ProfessionalsManagement />}
          {activeTab === 'clientes' && <ClientsManagement />}
          {activeTab === 'settings' && <SettingsManagement />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-card/95 border-t border-border-subtle px-2 py-2 flex justify-around items-center backdrop-blur-xl shadow-2xl">
        {bottomBarTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gold-base/15 text-gold-hover border border-gold-base/30 shadow-sm font-bold scale-105'
                  : 'text-content-muted hover:text-content-base'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-gold-hover' : 'text-content-muted'}`} />
              <span className={`text-[9px] ${isActive ? 'font-black text-gold-hover' : 'font-medium text-content-muted'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Sidebar Drawer Trigger Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl text-content-muted hover:text-content-base transition-all"
        >
          <Menu className="w-4.5 h-4.5" />
          <span className="text-[9px] font-medium text-content-muted">Mais</span>
        </button>
      </nav>

      {/* Mobile Full Sidebar Drawer Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-surface-base/80 backdrop-blur-sm flex justify-end">
          <div className="w-3/4 max-w-[280px] bg-surface-card h-full border-l border-border-subtle flex flex-col p-4 overflow-y-auto animate-fade-in space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gold-base text-surface-base font-black text-sm flex items-center justify-center">
                  n
                </div>
                <span className="text-sm font-bold text-content-base">Menu BarberX</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-content-muted hover:text-content-base hover:bg-surface-base"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 flex-1">
              {sidebarSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-2 px-2">
                    {section.title}
                  </div>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-gold-base/10 text-gold-hover border border-gold-base/30'
                            : 'text-content-muted hover:text-content-base bg-surface-base'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-gold-hover' : 'text-content-muted'}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-content-muted" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border-subtle text-center">
              <span className="text-[11px] text-content-muted">BarberX Premium Admin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


