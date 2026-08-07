import React, { useState } from 'react';
import { NavoHomeView } from './NavoHomeView';
import { ScheduleGrid } from './ScheduleGrid';
import { PdvInteligente } from './PdvInteligente';
import { ServicesManagement } from './ServicesManagement';
import { ProfessionalsManagement } from './ProfessionalsManagement';
import { ClientsManagement } from './ClientsManagement';
import { WaitingQueue } from './WaitingQueue';
import { SettingsManagement } from './SettingsManagement';
import { NavoRewardsAdmin } from './NavoRewardsAdmin';
import { 
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
  LogOut,
  Receipt,
  Award,
  MoreHorizontal
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'agenda' 
  | 'pdv'
  | 'queue' 
  | 'rewards'
  | 'servicos' 
  | 'profissionais' 
  | 'clientes' 
  | 'settings';

export const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  // PROTEÇÃO DE AUTENTICAÇÃO
  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('barberx_user');
      
      if (!userStr) {
        window.location.href = '/';
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          window.location.href = '/';
        } else {
          setIsAuthorized(true);
          setAdminName(user.name || 'Admin');
        }
      } catch {
        window.location.href = '/';
      }
    };
    
    checkAuth();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-surface-base">
        <div className="w-8 h-8 border-4 border-gold-base/20 border-t-gold-base rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { 
      id: 'dashboard' as AdminTab, 
      label: 'Dashboard', 
      icon: TrendingUp,
      description: 'Métricas e análises'
    },
    { 
      id: 'pdv' as AdminTab, 
      label: 'PDV / Caixa', 
      icon: Receipt,
      description: 'Checkout de serviços & vendas'
    },
    { 
      id: 'agenda' as AdminTab, 
      label: 'Agenda', 
      icon: Calendar,
      description: 'Gerenciar horários'
    },
    { 
      id: 'queue' as AdminTab, 
      label: 'Fila de Espera', 
      icon: Clock,
      description: 'Clientes aguardando'
    },
    { 
      id: 'rewards' as AdminTab, 
      label: 'Rewards & NPS', 
      icon: Award,
      description: 'Fidelidade e indicações'
    },
    { 
      id: 'servicos' as AdminTab, 
      label: 'Serviços', 
      icon: Scissors,
      description: 'Catálogo de serviços'
    },
    { 
      id: 'profissionais' as AdminTab, 
      label: 'Profissionais', 
      icon: Users,
      description: 'Equipe de barbeiros'
    },
    { 
      id: 'clientes' as AdminTab, 
      label: 'Clientes', 
      icon: UserCheck,
      description: 'Base de clientes'
    },
    { 
      id: 'settings' as AdminTab, 
      label: 'Configurações', 
      icon: Settings,
      description: 'Preferências do sistema'
    },
  ];

  // Quick 4 bottom bar items
  const bottomBarItems = [
    { id: 'agenda' as AdminTab, label: 'Agenda', icon: Calendar },
    { id: 'pdv' as AdminTab, label: 'PDV', icon: Receipt },
    { id: 'dashboard' as AdminTab, label: 'Caixa', icon: TrendingUp },
    { id: 'queue' as AdminTab, label: 'Fila', icon: Clock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <NavoHomeView onNavigateToAgenda={() => setActiveTab('agenda')} />;
      case 'pdv':
        return <PdvInteligente />;
      case 'agenda':
        return <ScheduleGrid />;
      case 'queue':
        return <WaitingQueue />;
      case 'rewards':
        return <NavoRewardsAdmin />;
      case 'servicos':
        return <ServicesManagement />;
      case 'profissionais':
        return <ProfessionalsManagement />;
      case 'clientes':
        return <ClientsManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('barberx_user');
    window.location.href = '/';
  };

  const isMoreActive = !bottomBarItems.some(item => item.id === activeTab);

  return (
    <div className="h-[100dvh] bg-surface-base flex text-content-base font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar (Fixed layout) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col shrink-0 lg:bg-surface-card lg:border-r lg:border-border-subtle lg:fixed lg:inset-y-0">
        {/* Logo Header (Fixed 56px height) */}
        <div className="flex items-center h-[56px] px-4 border-b border-border-subtle relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 right-0 h-0.5 barber-pole-line" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-gold-base text-surface-base rounded-md flex items-center justify-center shadow-sm shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-serif font-bold text-content-base tracking-tight truncate">Navo Premium</h1>
              <p className="text-[9px] text-gold-base font-bold uppercase tracking-widest truncate">Heritage Barber & Club</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-10 px-3 rounded-md text-xs font-semibold flex items-center gap-2.5 transition-colors group min-w-0 active:bg-surface-base ${
                  isActive
                    ? 'bg-gold-base/10 text-gold-base border border-gold-base/30'
                    : 'text-content-muted hover:text-content-base hover:bg-surface-base'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-base' : 'text-content-muted group-hover:text-content-base'}`} />
                <span className="flex-1 text-left truncate min-w-0">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-gold-base shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5 px-3 h-12 rounded-md bg-surface-base border border-border-subtle/80">
            <div className="w-7 h-7 rounded bg-gold-base flex items-center justify-center text-surface-base font-bold text-xs uppercase shrink-0">
              {adminName.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-content-base truncate">{adminName}</p>
              <p className="text-[9px] font-bold text-content-muted uppercase tracking-wider">Admin</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-card text-content-muted hover:text-gold-base active:bg-surface-card transition-colors shrink-0"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar (Fixed 56px height, min 40px touch targets) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-[56px] bg-surface-card border-b border-border-subtle z-40 px-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-md border border-border-subtle active:bg-surface-base text-gold-base"
          aria-label="Abrir Menu de Navegação"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 min-w-0 px-2">
          <div className="w-7 h-7 bg-gold-base rounded-md flex items-center justify-center text-surface-base shrink-0">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-serif font-bold text-content-base truncate">
            {navItems.find(i => i.id === activeTab)?.label || 'Navo Premium'}
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-md border border-border-subtle text-content-muted active:text-gold-base active:bg-surface-base"
          aria-label="Sair do sistema"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar (Max 5 items, touch target >= 40px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-surface-card border-t border-border-subtle z-40 flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {bottomBarItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 h-12 flex flex-col items-center justify-center gap-0.5 rounded-md transition-all active:scale-95 ${
                isActive ? 'text-gold-base font-bold' : 'text-content-muted hover:text-content-base'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] tracking-tight truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}

        {/* 5th Item: Menu / Mais */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`flex-1 h-12 flex flex-col items-center justify-center gap-0.5 rounded-md transition-all active:scale-95 ${
            isMoreActive ? 'text-gold-base font-bold' : 'text-content-muted hover:text-content-base'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">Mais</span>
        </button>
      </nav>

      {/* Mobile Drawer (Side sheet) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          
          <aside className="relative w-[280px] max-w-[80vw] bg-surface-card flex flex-col animate-slide-in shadow-2xl border-r border-border-subtle h-[100dvh]">
            {/* Header */}
            <div className="flex items-center justify-between h-[56px] px-4 border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-gold-base rounded-md flex items-center justify-center text-surface-base shrink-0">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <h1 className="text-sm font-serif font-bold text-content-base truncate">Navo Premium</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-md text-content-muted hover:text-content-base active:bg-surface-base"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full h-11 px-3 rounded-md text-xs font-semibold flex items-center gap-3 transition-colors active:bg-surface-base ${
                      isActive
                        ? 'bg-gold-base/10 text-gold-base border border-gold-base/30'
                        : 'text-content-muted hover:text-content-base hover:bg-surface-base'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-base' : 'text-content-muted'}`} />
                    <span className="truncate flex-1 text-left min-w-0">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            {/* Mobile Footer */}
            <div className="p-3 border-t border-border-subtle shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button 
                onClick={handleLogout}
                className="w-full h-11 flex items-center justify-center gap-2 px-3 rounded-md bg-surface-base text-content-muted hover:text-status-error border border-border-subtle font-semibold text-xs active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do sistema</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-[56px] lg:pt-0 h-[100dvh] overflow-y-auto no-scrollbar relative w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8 pb-28 lg:pb-12 w-full min-w-0">
          {/* Tab Content */}
          <div className="animate-fade-in w-full min-w-0">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};
