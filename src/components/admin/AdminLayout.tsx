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
  LogOut
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

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
        setAdminName(user.name || 'Admin');
      }
    } catch {
      window.location.href = '/';
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-base">
        <div className="w-8 h-8 border-4 border-gold-base/20 border-t-gold-base rounded-full animate-spin"></div>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <NavoHomeView onNavigateToAgenda={() => setActiveTab('agenda')} />;
      case 'agenda':
        return <ScheduleGrid />;
      case 'queue':
        return <WaitingQueue />;
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

  return (
    <div className="min-h-screen bg-surface-base flex text-content-base font-sans antialiased overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col shrink-0 lg:bg-surface-card lg:border-r lg:border-border-subtle lg:fixed lg:inset-y-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-base text-surface-base rounded-lg flex items-center justify-center shadow">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-black text-gold-hover tracking-tight">BarberX</h1>
              <p className="text-[10px] text-content-muted font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gold-base/10 text-gold-hover border border-gold-base/20 shadow-sm'
                    : 'text-content-muted hover:text-content-base hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-gold-hover' : 'text-content-muted group-hover:text-content-base'}`} />
                <div className="flex-1 text-left min-w-0">
                  <div className="truncate">{item.label}</div>
                  <div className={`text-[11px] mt-0.5 truncate ${isActive ? 'text-gold-hover/70' : 'text-content-muted/70'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-gold-hover shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-border-subtle/50">
            <div className="w-9 h-9 rounded-full bg-gold-base flex items-center justify-center text-surface-base font-black text-sm uppercase shrink-0">
              {adminName.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-content-base truncate">{adminName}</p>
              <p className="text-[10px] font-semibold text-content-muted uppercase tracking-wider">Admin</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 text-content-muted hover:text-gold-hover transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle z-40">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl border border-border-subtle hover:bg-white/5 transition-colors text-gold-hover"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold-base rounded-lg flex items-center justify-center text-surface-base shadow">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-base font-black tracking-tight text-gold-hover">BarberX</h1>
          </div>

          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          
          <aside className="relative w-[280px] max-w-[80vw] bg-surface-card flex flex-col animate-slide-in shadow-2xl border-r border-border-subtle">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gold-base rounded-lg flex items-center justify-center text-surface-base shadow">
                  <Scissors className="w-4 h-4" />
                </div>
                <h1 className="text-base font-black text-gold-hover">BarberX</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-content-muted hover:text-content-base hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
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
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gold-base/10 text-gold-hover border border-gold-base/20'
                        : 'text-content-muted hover:text-content-base hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-gold-hover' : 'text-content-muted'}`} />
                    <div className="flex-1 text-left min-w-0">
                      <div className="truncate">{item.label}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
            
            {/* Mobile Footer */}
            <div className="p-4 border-t border-border-subtle">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-content-muted hover:text-status-error hover:bg-status-error/10 transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do sistema</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 h-[100dvh] overflow-y-auto no-scrollbar relative w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-24 w-full">
          {/* Page Header */}
          <div className="mb-6 lg:mb-10">
            <h2 className="text-2xl font-black text-content-base mb-1 tracking-tight">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
            <p className="text-sm font-medium text-content-muted">
              {navItems.find(item => item.id === activeTab)?.description}
            </p>
          </div>

          {/* Content */}
          <div className="animate-fade-in w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};
