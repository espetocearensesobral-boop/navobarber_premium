import React, { useState, useEffect } from 'react';
import { 
  fetchAppointmentsFromSupabase, 
  fetchServicesFromSupabase, 
  fetchProductsFromSupabase, 
  fetchProfessionalsFromSupabase,
  getQueueFromSupabase
} from '../../services/supabaseDataService';
import { Appointment, ServiceItem, ProductItem, Professional, WaitingQueueItem } from '../../types';
import { 
  Receipt, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  User, 
  Scissors, 
  Percent, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Printer, 
  Share2, 
  Sparkles, 
  Wallet, 
  Check, 
  X,
  Phone,
  Calendar,
  Gift,
  ArrowRight
} from 'lucide-react';

export interface CartItem {
  id: string;
  type: 'service' | 'product';
  title: string;
  price: number;
  quantity: number;
  barberId?: string;
  barberName?: string;
}

export interface PdvTransaction {
  id: string;
  clientName: string;
  clientPhone?: string;
  professionalName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'split';
  paymentDetails?: string;
  timestamp: string;
  appointmentId?: string;
}

export const PdvInteligente: React.FC = () => {
  // Global Data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [queue, setQueue] = useState<WaitingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // PDV Active Sale State
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'servicos' | 'produtos' | 'fila'>('agendamentos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart State
  const [selectedClientName, setSelectedClientName] = useState('Cliente Avulso');
  const [selectedClientPhone, setSelectedClientPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<Professional | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash' | 'split'>('pix');
  const [cashAmountGiven, setCashAmountGiven] = useState<string>('');
  const [linkedAppointmentId, setLinkedAppointmentId] = useState<string | null>(null);

  // Modals & UI States
  const [isCaixaOpen, setIsCaixaOpen] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<PdvTransaction | null>(null);
  const [todaysSales, setTodaysSales] = useState<PdvTransaction[]>([]);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [pixConfirmed, setPixConfirmed] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [apts, srvs, prods, profs, q] = await Promise.all([
        fetchAppointmentsFromSupabase(),
        fetchServicesFromSupabase(),
        fetchProductsFromSupabase(),
        fetchProfessionalsFromSupabase(),
        getQueueFromSupabase()
      ]);
      setAppointments(apts);
      setServices(srvs);
      setProducts(prods);
      setProfessionals(profs);
      setQueue(q);

      if (profs.length > 0 && !selectedBarber) {
        setSelectedBarber(profs[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do PDV:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Carregar vendas salvas do localStorage
    const savedSales = localStorage.getItem('navo_pdv_sales_today');
    if (savedSales) {
      try {
        setTodaysSales(JSON.parse(savedSales));
      } catch (e) {}
    }
  }, []);

  // Filter Today's Pending Appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAppointments = appointments.filter(a => 
    (a.date === todayStr || a.status === 'confirmed' || a.status === 'in_service' || a.status === 'in_queue') &&
    a.status !== 'cancelled' &&
    a.status !== 'completed'
  );

  // Select Appointment for Checkout
  const handleSelectAppointmentForCheckout = (apt: Appointment) => {
    setLinkedAppointmentId(apt.id);
    setSelectedClientName(apt.client_name || 'Cliente');
    setSelectedClientPhone(apt.client_phone || '');
    
    // Find professional
    const prof = professionals.find(p => p.id === apt.professional_id || p.name === apt.professional_name);
    if (prof) setSelectedBarber(prof);

    // Map services to cart
    const items: CartItem[] = (apt.services || []).map(s => ({
      id: s.id,
      type: 'service',
      title: s.title,
      price: s.price,
      quantity: 1,
      barberId: prof?.id,
      barberName: prof?.name || apt.professional_name
    }));

    setCart(items);
    setDiscountAmount(apt.discount_amount || 0);
  };

  // Select Queue Item for Checkout
  const handleSelectQueueItemForCheckout = (qItem: WaitingQueueItem) => {
    setSelectedClientName(qItem.client_name || 'Cliente');
    setSelectedClientPhone(qItem.client_phone || '');
    
    const prof = professionals.find(p => p.id === qItem.professional_id || p.name === qItem.professional_name);
    if (prof) setSelectedBarber(prof);

    const item: CartItem = {
      id: `q_srv_${Date.now()}`,
      type: 'service',
      title: qItem.service_title,
      price: qItem.service_price || 85,
      quantity: 1,
      barberId: prof?.id,
      barberName: prof?.name || qItem.professional_name
    };

    setCart([item]);
  };

  // Cart Handlers
  const handleAddServiceToCart = (srv: ServiceItem) => {
    const existing = cart.find(i => i.id === srv.id);
    if (existing) {
      setCart(cart.map(i => i.id === srv.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, {
        id: srv.id,
        type: 'service',
        title: srv.title,
        price: srv.price,
        quantity: 1,
        barberId: selectedBarber?.id,
        barberName: selectedBarber?.name
      }]);
    }
  };

  const handleAddProductToCart = (prod: ProductItem) => {
    const existing = cart.find(i => i.id === prod.id);
    if (existing) {
      setCart(cart.map(i => i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, {
        id: prod.id,
        type: 'product',
        title: prod.name,
        price: prod.price,
        quantity: 1,
        barberId: selectedBarber?.id,
        barberName: selectedBarber?.name
      }]);
    }
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setSelectedClientName('Cliente Avulso');
    setSelectedClientPhone('');
    setDiscountAmount(0);
    setTipAmount(0);
    setCashAmountGiven('');
    setLinkedAppointmentId(null);
    setPixConfirmed(false);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = Math.max(0, subtotal - discountAmount + tipAmount);
  
  // Barber Commission Estimation
  const estimatedCommission = cart.reduce((acc, item) => {
    if (item.type === 'service') {
      const rate = selectedBarber?.commission_rate || 0.40; // 40% default
      return acc + (item.price * item.quantity * rate);
    } else {
      return acc + (item.price * item.quantity * 0.10); // 10% on products
    }
  }, 0);

  // Troco Calculation
  const cashNum = parseFloat(cashAmountGiven.replace(',', '.')) || 0;
  const changeAmount = cashNum > finalTotal ? cashNum - finalTotal : 0;

  // Checkout Completion
  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    const tx: PdvTransaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      clientName: selectedClientName || 'Cliente Avulso',
      clientPhone: selectedClientPhone,
      professionalName: selectedBarber?.name || 'Profissional',
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tip: tipAmount,
      total: finalTotal,
      paymentMethod,
      paymentDetails: paymentMethod === 'cash' ? `Recebido R$ ${cashNum.toFixed(2)} (Troco R$ ${changeAmount.toFixed(2)})` : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appointmentId: linkedAppointmentId || undefined
    };

    // Save to sales history
    const updatedSales = [tx, ...todaysSales];
    setTodaysSales(updatedSales);
    localStorage.setItem('navo_pdv_sales_today', JSON.stringify(updatedSales));

    // Update appointment if linked
    if (linkedAppointmentId) {
      setAppointments(prev => prev.map(a => a.id === linkedAppointmentId ? { ...a, status: 'completed' } : a));
    }

    setLastTransaction(tx);
    setShowReceiptModal(true);
    handleClearCart();
  };

  // Total Revenue Today
  const totalRevenueToday = todaysSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="space-y-6">
      {/* TOP HEADER: STATUS DO CAIXA & MÉTRICAS RÁPIDAS */}
      <div className="bg-surface-card rounded-none border border-border-subtle p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-none bg-gold-base/10 border border-gold-base/30 text-gold-hover flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-content-base tracking-tight">PDV Inteligente</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isCaixaOpen 
                    ? 'bg-status-success/10 text-status-success border-status-success/30' 
                    : 'bg-status-error/10 text-status-error border-status-error/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isCaixaOpen ? 'bg-status-success animate-pulse' : 'bg-status-error'}`} />
                  {isCaixaOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
                </span>
              </div>
              <p className="text-xs text-content-muted mt-0.5">
                Gerencie checkouts de serviços, adicionais e vendas de produtos em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowSalesHistory(true)}
              className="px-3.5 py-2 rounded-none bg-surface-base border border-border-subtle hover:bg-white/5 text-content-base text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Receipt className="w-4 h-4 text-gold-hover" />
              <span>Vendas de Hoje ({todaysSales.length})</span>
            </button>

            <button
              onClick={() => setIsCaixaOpen(!isCaixaOpen)}
              className={`px-3.5 py-2 rounded-none text-xs font-bold transition-all ${
                isCaixaOpen 
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-status-success/10 hover:bg-status-success/20 text-status-success border border-status-success/30'
              }`}
            >
              {isCaixaOpen ? 'Fechar Caixa' : 'Abrir Caixa'}
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-none bg-surface-base border border-border-subtle/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-content-muted font-semibold uppercase tracking-wider block">Faturamento Hoje</span>
              <span className="text-base font-extrabold text-content-base">R$ {totalRevenueToday.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 rounded-none bg-surface-base border border-border-subtle/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-content-muted font-semibold uppercase tracking-wider block">Checkouts Realizados</span>
              <span className="text-base font-extrabold text-content-base">{todaysSales.length} atendimentos</span>
            </div>
          </div>

          <div className="p-3 rounded-none bg-surface-base border border-border-subtle/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-content-muted font-semibold uppercase tracking-wider block">Aguardando Pagamento</span>
              <span className="text-base font-extrabold text-content-base">{pendingAppointments.length} agendamentos</span>
            </div>
          </div>

          <div className="p-3 rounded-none bg-surface-base border border-border-subtle/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-content-muted font-semibold uppercase tracking-wider block">Produtos Disponíveis</span>
              <span className="text-base font-extrabold text-content-base">{products.length} itens</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT CATALOG & PENDING APPOINTMENTS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tabs & Search */}
          <div className="bg-surface-card rounded-none border border-border-subtle p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('agendamentos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'agendamentos'
                      ? 'bg-gold-base text-surface-base shadow'
                      : 'text-content-muted hover:text-content-base hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hoje ({pendingAppointments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('servicos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'servicos'
                      ? 'bg-gold-base text-surface-base shadow'
                      : 'text-content-muted hover:text-content-base hover:bg-white/5'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Serviços ({services.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('produtos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'produtos'
                      ? 'bg-gold-base text-surface-base shadow'
                      : 'text-content-muted hover:text-content-base hover:bg-white/5'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Produtos ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('fila')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'fila'
                      ? 'bg-gold-base text-surface-base shadow'
                      : 'text-content-muted hover:text-content-base hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fila ({queue.length})</span>
                </button>
              </div>

              <button
                onClick={loadData}
                className="p-1.5 rounded-lg text-content-muted hover:text-content-base hover:bg-white/5 transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, serviço ou produto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface-base border border-border-subtle rounded-none pl-9 pr-4 py-2 text-xs text-content-base placeholder:text-content-muted focus:outline-none focus:border-gold-base transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-base"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="bg-surface-card rounded-none border border-border-subtle p-4 min-h-[420px] max-h-[560px] overflow-y-auto no-scrollbar">
            
            {/* TAB 1: AGENDAMENTOS DO DIA */}
            {activeTab === 'agendamentos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-content-muted font-bold uppercase tracking-wider mb-2">
                  <span>Agendamentos Pendentes de Cobrança</span>
                  <span>{pendingAppointments.length} agendamentos</span>
                </div>

                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-12 text-content-muted space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-status-success mx-auto opacity-80" />
                    <p className="text-sm font-semibold text-content-base">Nenhum agendamento pendente para hoje!</p>
                    <p className="text-xs">Todos os agendamentos do dia já foram pagos ou você pode iniciar um novo checkout avulso.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {pendingAppointments
                      .filter(a => 
                        a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.professional_name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(apt => (
                        <div
                          key={apt.id}
                          className={`p-3.5 rounded-none border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            linkedAppointmentId === apt.id
                              ? 'bg-gold-base/10 border-gold-base shadow-sm'
                              : 'bg-surface-base border-border-subtle hover:border-gold-base/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-gold-base/20 text-gold-hover font-bold text-[10px]">
                                {apt.time_slot}
                              </span>
                              <h3 className="font-bold text-content-base text-sm">{apt.client_name}</h3>
                              {apt.client_phone && (
                                <span className="text-[11px] text-content-muted">({apt.client_phone})</span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
                              <span className="flex items-center gap-1 font-medium text-content-base">
                                <Scissors className="w-3 h-3 text-gold-hover" />
                                {apt.professional_name}
                              </span>
                              <span>•</span>
                              <span>{(apt.services || []).map(s => s.title).join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle">
                            <div className="text-right">
                              <span className="block text-[10px] text-content-muted font-bold uppercase">Total</span>
                              <span className="text-sm font-extrabold text-status-success">
                                R$ {apt.final_amount.toFixed(2)}
                              </span>
                            </div>

                            <button
                              onClick={() => handleSelectAppointmentForCheckout(apt)}
                              className={`px-3.5 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 ${
                                linkedAppointmentId === apt.id
                                  ? 'bg-gold-base text-surface-base shadow'
                                  : 'bg-gold-base/10 text-gold-hover hover:bg-gold-base hover:text-surface-base'
                              }`}
                            >
                              <span>{linkedAppointmentId === apt.id ? 'Selecionado' : 'Carregar no Caixa'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CATÁLOGO DE SERVIÇOS */}
            {activeTab === 'servicos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {services
                  .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(srv => (
                    <div
                      key={srv.id}
                      onClick={() => handleAddServiceToCart(srv)}
                      className="p-3 rounded-none bg-surface-base border border-border-subtle hover:border-gold-base/60 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-content-base text-xs group-hover:text-gold-hover transition-colors">
                          {srv.title}
                        </h4>
                        <p className="text-[10px] text-content-muted">
                          {srv.duration_minutes} min • {srv.description || 'Serviço de alta precisão'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-black text-status-success text-xs">
                          R$ {srv.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gold-hover font-bold inline-flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* TAB 3: CATÁLOGO DE PRODUTOS */}
            {activeTab === 'produtos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => handleAddProductToCart(prod)}
                      className="p-3 rounded-none bg-surface-base border border-border-subtle hover:border-gold-base/60 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gold-base/10 text-gold-hover flex items-center justify-center font-bold text-xs shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-content-muted uppercase tracking-wider block truncate">
                            {prod.brand}
                          </span>
                          <h4 className="font-bold text-content-base text-xs group-hover:text-gold-hover transition-colors truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] text-content-muted">Estoque: {prod.stock_quantity} un</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-black text-status-success text-xs">
                          R$ {prod.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gold-hover font-bold inline-flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* TAB 4: FILA DE ESPERA */}
            {activeTab === 'fila' && (
              <div className="space-y-2.5">
                {queue.length === 0 ? (
                  <div className="text-center py-10 text-content-muted text-xs">
                    Nenhum cliente na fila de espera no momento.
                  </div>
                ) : (
                  queue.map(q => (
                    <div
                      key={q.id}
                      className="p-3 rounded-none bg-surface-base border border-border-subtle flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-content-base text-xs">{q.client_name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                            Fila
                          </span>
                        </div>
                        <p className="text-[11px] text-content-muted mt-0.5">
                          {q.service_title} • Barbeiro: {q.professional_name}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectQueueItemForCheckout(q)}
                        className="px-3 py-1.5 rounded-lg bg-gold-base/10 hover:bg-gold-base text-gold-hover hover:text-surface-base text-xs font-bold transition-all"
                      >
                        Cobrar
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: CARRINHO E CHECKOUT DO CAIXA (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-card rounded-none border border-border-subtle p-4 sm:p-5 shadow-lg flex flex-col justify-between min-h-[580px]">
            
            {/* Header / Client & Barber Selector */}
            <div className="space-y-3 pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gold-hover" />
                  <h2 className="font-bold text-content-base text-base">Checkout de Caixa</h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-status-error hover:underline font-semibold"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Client Name Input */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={selectedClientName}
                    onChange={e => setSelectedClientName(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full bg-surface-base border border-border-subtle rounded-none px-2.5 py-1.5 text-xs font-semibold text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                    Telefone (Opcional)
                  </label>
                  <input
                    type="text"
                    value={selectedClientPhone}
                    onChange={e => setSelectedClientPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-surface-base border border-border-subtle rounded-none px-2.5 py-1.5 text-xs text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>
              </div>

              {/* Professional Barbeiro Selector */}
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                  Profissional Atendente
                </label>
                <select
                  value={selectedBarber?.id || ''}
                  onChange={e => {
                    const prof = professionals.find(p => p.id === e.target.value);
                    if (prof) setSelectedBarber(prof);
                  }}
                  className="w-full bg-surface-base border border-border-subtle rounded-none px-2.5 py-1.5 text-xs font-semibold text-content-base focus:outline-none focus:border-gold-base"
                >
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.nickname || p.role}) — {Math.round(p.commission_rate * 100)}% comissão
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CART ITEMS LIST */}
            <div className="flex-1 py-3 my-1 overflow-y-auto max-h-[220px] space-y-2 no-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-content-muted space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto opacity-50 text-gold-hover" />
                  <p className="text-xs font-medium">Seu carrinho está vazio.</p>
                  <p className="text-[10px]">Selecione um agendamento do dia ou adicione serviços e produtos ao lado.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-none bg-surface-base border border-border-subtle flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'service' ? 'bg-gold-hover' : 'bg-emerald-400'}`} />
                        <h4 className="font-bold text-content-base text-xs truncate">{item.title}</h4>
                      </div>
                      <span className="text-[10px] text-content-muted block">
                        R$ {item.price.toFixed(2)} cada
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-white/5 border border-border-subtle rounded-lg p-0.5">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-content-muted"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-content-base px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-content-muted"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-content-base w-16 text-right">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-content-muted hover:text-status-error transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FINANCIAL BREAKDOWN & DISCOUNTS */}
            <div className="pt-3 border-t border-border-subtle space-y-2.5 text-xs">
              
              {/* Discounts & Tip controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase mb-1">
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={e => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full bg-surface-base border border-border-subtle rounded-none px-2.5 py-1 text-xs font-bold text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase mb-1">
                    Gorjeta Barbeiro (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tipAmount || ''}
                    onChange={e => setTipAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full bg-surface-base border border-border-subtle rounded-none px-2.5 py-1 text-xs font-bold text-content-base focus:outline-none focus:border-gold-base"
                  />
                </div>
              </div>

              {/* Subtotal, Discount & Total Row */}
              <div className="space-y-1 py-1">
                <div className="flex justify-between text-content-muted text-xs">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-status-success text-xs font-semibold">
                    <span>Desconto Aplicado</span>
                    <span>- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-gold-hover text-xs font-semibold">
                    <span>Gorjeta Profissional</span>
                    <span>+ R$ {tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-content-muted text-[10px] italic">
                  <span>Comissão estimada p/ {selectedBarber?.name.split(' ')[0]}</span>
                  <span>R$ {estimatedCommission.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-base font-black text-content-base pt-2 border-t border-border-subtle">
                  <span>TOTAL FINAL</span>
                  <span className="text-xl font-black text-status-success">
                    R$ {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-2 px-1 rounded-none text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-gold-base/15 text-gold-hover border-gold-base'
                        : 'bg-surface-base border-border-subtle text-content-muted hover:text-content-base'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`py-2 px-1 rounded-none text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'bg-gold-base/15 text-gold-hover border-gold-base'
                        : 'bg-surface-base border-border-subtle text-content-muted hover:text-content-base'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Crédito</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('debit_card')}
                    className={`py-2 px-1 rounded-none text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'debit_card'
                        ? 'bg-gold-base/15 text-gold-hover border-gold-base'
                        : 'bg-surface-base border-border-subtle text-content-muted hover:text-content-base'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Débito</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-1 rounded-none text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-gold-base/15 text-gold-hover border-gold-base'
                        : 'bg-surface-base border-border-subtle text-content-muted hover:text-content-base'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Dinheiro</span>
                  </button>
                </div>
              </div>

              {/* CASH TROCO CALCULATOR */}
              {paymentMethod === 'cash' && (
                <div className="p-2.5 rounded-none bg-surface-base border border-border-subtle space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-content-muted">Valor Recebido (R$):</span>
                    <input
                      type="text"
                      value={cashAmountGiven}
                      onChange={e => setCashAmountGiven(e.target.value)}
                      placeholder={finalTotal.toFixed(2)}
                      className="w-28 bg-surface-card border border-border-subtle rounded-lg px-2 py-1 text-xs font-bold text-right text-content-base focus:outline-none focus:border-gold-base"
                    />
                  </div>
                  {cashNum > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-border-subtle">
                      <span className="text-content-muted">Troco a devolver:</span>
                      <span className={changeAmount >= 0 ? 'text-emerald-400 font-black' : 'text-status-error'}>
                        R$ {changeAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* FINAL CHECKOUT ACTION BUTTON */}
              <button
                onClick={handleFinalizeSale}
                disabled={cart.length === 0 || !isCaixaOpen}
                className="w-full py-3.5 px-4 rounded-none bg-gold-base hover:bg-gold-hover disabled:opacity-40 text-surface-base font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>FINALIZAR E EMITIR RECIBO (R$ {finalTotal.toFixed(2)})</span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* RECEIPT / COMPROVANTE MODAL */}
      {showReceiptModal && lastTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-[380px] bg-[#faf8f4] text-[#1a1a1a] rounded-[24px] overflow-hidden shadow-2xl border border-[#e8e0d4] relative animate-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#ede8e0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c9a84c] flex items-center justify-center text-white shadow-sm">
                  <Scissors className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#2d2a26]">Venda Finalizada</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-7 h-7 rounded-full bg-[#f0ebe3] hover:bg-[#e5ddd2] flex items-center justify-center text-[#9a9188] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>

              <h2 className="text-xl font-bold tracking-[0.1em] text-[#2d2a26] uppercase font-serif">NAVO PREMIUM</h2>
              <div className="text-[10px] text-[#b0a898] font-mono tracking-wider uppercase">
                COMPROVANTE #{lastTransaction.id}
              </div>

              <div className="p-3 rounded-none bg-[#f5f2ec] border border-[#ede8e0] space-y-1.5 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7a7268]">Cliente:</span>
                  <span className="font-bold text-[#2d2a26]">{lastTransaction.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a7268]">Profissional:</span>
                  <span className="font-bold text-[#2d2a26]">{lastTransaction.professionalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a7268]">Pagamento:</span>
                  <span className="font-bold text-[#2d2a26] uppercase">{lastTransaction.paymentMethod}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-b border-dashed border-[#ddd5c8] py-2.5 text-xs text-left space-y-1">
                {lastTransaction.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.title}</span>
                    <span className="font-bold">R$ {(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-sm font-bold pt-1">
                <span>TOTAL PAGO:</span>
                <span className="text-lg text-[#16a34a] font-extrabold">R$ {lastTransaction.total.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-none bg-[#e8e0d4] hover:bg-[#ddd5c8] text-[#5a5248] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>

                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="py-2.5 px-3 rounded-none bg-[#2d2a26] hover:bg-[#1a1815] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Concluir</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* HISTÓRICO DE VENDAS DO DIA MODAL */}
      {showSalesHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-surface-card border border-border-subtle rounded-none p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gold-hover" />
                <h3 className="font-bold text-content-base text-base">Vendas e Recebimentos de Hoje</h3>
              </div>
              <button
                onClick={() => setShowSalesHistory(false)}
                className="p-1 rounded-lg text-content-muted hover:text-content-base"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {todaysSales.length === 0 ? (
                <div className="text-center py-12 text-content-muted text-xs">
                  Nenhuma venda realizada hoje ainda.
                </div>
              ) : (
                todaysSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3.5 rounded-none bg-surface-base border border-border-subtle flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-base/15 text-gold-hover">
                          {sale.timestamp}
                        </span>
                        <h4 className="font-bold text-content-base text-xs truncate">{sale.clientName}</h4>
                        <span className="text-[10px] text-content-muted">({sale.professionalName})</span>
                      </div>
                      <p className="text-[11px] text-content-muted truncate">
                        {sale.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-status-success text-sm">
                        R$ {sale.total.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-content-muted uppercase">
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-border-subtle flex justify-between items-center text-xs">
              <span className="text-content-muted">Total de {todaysSales.length} transação(ões)</span>
              <span className="font-bold text-content-base">Faturamento: <strong className="text-status-success text-sm font-black">R$ {totalRevenueToday.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
