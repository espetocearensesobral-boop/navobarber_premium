import { authFetch } from '../lib/api';
import { ServiceItem, Professional, Appointment, WaitingQueueItem, ProductItem } from '../types';

export interface ScheduleBlock {
  id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

const API_BASE = '/api';

let servicesCache: ServiceItem[] | null = null;
let servicesFetchPromise: Promise<ServiceItem[]> | null = null;

export function getCachedServices(): ServiceItem[] | null {
  return servicesCache;
}

export async function fetchServicesFromSupabase(forceRefresh = false): Promise<ServiceItem[]> {
  if (servicesCache && !forceRefresh) {
    return servicesCache;
  }
  if (servicesFetchPromise && !forceRefresh) {
    return servicesFetchPromise;
  }
  servicesFetchPromise = (async () => {
    try {
      const res = await authFetch(`${API_BASE}/services?_t=${Date.now()}`);
      if (!res.ok) throw new Error('Falha ao buscar serviços do Supabase');
      const data = await res.json();
      if (!Array.isArray(data)) {
        servicesCache = [];
        return [];
      }
      const mapped = data.map((s: any) => ({
        id: s.id,
        category_id: `cat_${s.categorySlug}`,
        title: s.title,
        description: s.description,
        price: Number(s.price),
        duration_minutes: s.durationMinutes,
        is_combo: s.isCombo,
        original_price: s.originalPrice ? Number(s.originalPrice) : undefined,
        discount_percentage: s.discountPercentage,
        popular: s.isPopular,
        image_url: s.imageUrl,
        gallery_urls: Array.isArray(s.galleryUrls) && s.galleryUrls.length > 0 ? s.galleryUrls : (s.imageUrl ? [s.imageUrl] : [])
      }));
      servicesCache = mapped;
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar serviços do Supabase:', err);
      return servicesCache || [];
    } finally {
      servicesFetchPromise = null;
    }
  })();
  return servicesFetchPromise;
}

export async function deleteAllServicesInSupabase(): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/services/all`, { method: 'DELETE' });
    if (res.ok) {
      servicesCache = [];
    }
    return res.ok;
  } catch (err) {
    console.error('Erro ao apagar todos os serviços:', err);
    return false;
  }
}

let professionalsCache: Professional[] | null = null;
let professionalsFetchPromise: Promise<Professional[]> | null = null;

export function getCachedProfessionals(): Professional[] | null {
  return professionalsCache;
}

export async function fetchProfessionalsFromSupabase(forceRefresh = false): Promise<Professional[]> {
  if (professionalsCache && !forceRefresh) {
    return professionalsCache;
  }
  if (professionalsFetchPromise && !forceRefresh) {
    return professionalsFetchPromise;
  }
  professionalsFetchPromise = (async () => {
    try {
      const res = await authFetch(`${API_BASE}/professionals`);
      if (!res.ok) throw new Error('Falha ao buscar profissionais do Supabase');
      const data = await res.json();
      if (!Array.isArray(data)) {
        professionalsCache = [];
        return [];
      }
      const mapped = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        role: p.roleTitle,
        rating: Number(p.rating),
        reviews_count: p.reviewsCount,
        photo_url: p.photoUrl,
        specialties: p.specialties || [],
        commission_rate: Number(p.commissionRate),
        working_hours: p.workingHours,
        is_active: p.isActive ?? true
      }));
      professionalsCache = mapped;
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar profissionais do Supabase:', err);
      return professionalsCache || [];
    } finally {
      professionalsFetchPromise = null;
    }
  })();
  return professionalsFetchPromise;
}

export async function fetchAppointmentsFromSupabase(phone?: string): Promise<Appointment[]> {
  try {
    const url = phone ? `${API_BASE}/appointments?phone=${encodeURIComponent(phone)}` : `${API_BASE}/appointments`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Falha ao buscar agendamentos do Supabase');
    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((a: any) => ({
      id: a.id,
      client_id: a.clientId || a.client_id || '',
      client_name: a.clientName || a.client_name || '',
      client_phone: a.clientPhone || a.client_phone || '',
      professional_id: a.professionalId || a.professional_id || '',
      professional_name: a.professionalName || a.professional_name || '',
      date: a.date,
      time_slot: a.timeSlot || a.time_slot,
      status: a.status || 'confirmed',
      total_duration_minutes: Number(a.totalDurationMinutes || a.total_duration_minutes || 0),
      original_amount: Number(a.originalAmount || a.original_amount || 0),
      discount_amount: Number(a.discountAmount || a.discount_amount || 0),
      final_amount: Number(a.finalAmount || a.final_amount || 0),
      payment_method: a.paymentMethod || a.payment_method || 'PIX',
      loyalty_points_used: Number(a.loyaltyPointsUsed || a.loyalty_points_used || 0),
      created_at: a.createdAt || a.created_at || new Date().toISOString(),
      services: a.services || []
    }));
  } catch (err) {
    console.error('Erro ao carregar agendamentos do Supabase:', err);
    return [];
  }
}

export async function createAppointmentInSupabase(apt: Appointment): Promise<Appointment> {
  const res = await authFetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: apt.id,
      clientId: apt.client_id,
      clientName: apt.client_name,
      clientPhone: apt.client_phone,
      professionalId: apt.professional_id,
      professionalName: apt.professional_name,
      date: apt.date,
      timeSlot: apt.time_slot,
      status: apt.status,
      totalDurationMinutes: apt.total_duration_minutes,
      originalAmount: (apt.original_amount ?? 0).toString(),
      discountAmount: (apt.discount_amount ?? 0).toString(),
      finalAmount: (apt.final_amount ?? 0).toString(),
      paymentMethod: apt.payment_method,
      services: apt.services
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Falha ao criar agendamento no Supabase');
  }
  const created = await res.json();
  return {
    ...apt,
    id: created.id || apt.id,
    status: created.status || apt.status
  };
}

export async function cancelAppointmentInSupabase(
  appointmentId: string,
  fullApt?: Appointment
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  try {
    const res = await authFetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullApt || {})
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Falha ao cancelar agendamento no servidor Supabase');
    }
    
    const data = await res.json();
    const serverApt = data.appointment || data;
    
    const updatedAppointment: Appointment = {
      id: serverApt.id || appointmentId,
      client_id: serverApt.clientId || serverApt.client_id || fullApt?.client_id || '',
      client_name: serverApt.clientName || serverApt.client_name || fullApt?.client_name || '',
      client_phone: serverApt.clientPhone || serverApt.client_phone || fullApt?.client_phone || '',
      professional_id: serverApt.professionalId || serverApt.professional_id || fullApt?.professional_id || '',
      professional_name: serverApt.professionalName || serverApt.professional_name || fullApt?.professional_name || '',
      date: serverApt.date || fullApt?.date || '',
      time_slot: serverApt.timeSlot || serverApt.time_slot || fullApt?.time_slot || '',
      status: 'cancelled',
      total_duration_minutes: Number(serverApt.totalDurationMinutes || fullApt?.total_duration_minutes || 0),
      original_amount: Number(serverApt.originalAmount || fullApt?.original_amount || 0),
      discount_amount: Number(serverApt.discountAmount || fullApt?.discount_amount || 0),
      final_amount: Number(serverApt.finalAmount || fullApt?.final_amount || 0),
      loyalty_points_used: Number(serverApt.loyalty_points_used || fullApt?.loyalty_points_used || 0),
      payment_method: serverApt.paymentMethod || serverApt.payment_method || fullApt?.payment_method || 'pix',
      services: serverApt.services || fullApt?.services || [],
      created_at: serverApt.createdAt || serverApt.created_at || fullApt?.created_at || new Date().toISOString()
    };

    return { success: true, appointment: updatedAppointment };
  } catch (err: any) {
    console.error('Erro ao cancelar agendamento no Supabase:', err);
    return { success: false, error: err.message || 'Erro de conexão ao cancelar no Supabase.' };
  }
}

export async function getQueueFromSupabase(): Promise<WaitingQueueItem[]> {
  try {
    const res = await authFetch(`${API_BASE}/queue`);
    if (!res.ok) throw new Error('Falha ao obter fila de espera do Supabase');
    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((q: any) => ({
      id: q.id,
      client_name: q.clientName || 'Cliente Avulso',
      client_phone: q.clientPhone || '',
      service_title: q.serviceTitle || 'Atendimento Geral',
      service_price: q.servicePrice ? Number(q.servicePrice) : undefined,
      professional_id: q.professionalId,
      professional_name: q.professionalName || '',
      scheduled_time: q.scheduledTime || '',
      estimated_wait_minutes: q.estimatedWaitMinutes || 0,
      status: q.status || 'waiting',
      arrived_at: q.arrivedAt || '',
      notes: q.notes || '',
      started_at: q.startedAt,
      completed_at: q.completedAt
    }));
  } catch (err) {
    console.error('Erro ao obter fila do Supabase:', err);
    return [];
  }
}

export async function addToQueueInSupabase(newItem: Partial<WaitingQueueItem>): Promise<WaitingQueueItem[]> {
  const itemToSave = {
    id: newItem.id || `q_${Date.now()}`,
    clientName: newItem.client_name || 'Cliente Walk-in',
    clientPhone: newItem.client_phone || '',
    serviceTitle: newItem.service_title || 'Corte & Barba',
    servicePrice: newItem.service_price?.toString() || '85',
    professionalId: newItem.professional_id || '',
    professionalName: newItem.professional_name || '',
    scheduledTime: newItem.scheduled_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedWaitMinutes: newItem.estimated_wait_minutes || 15,
    status: newItem.status || 'waiting',
    arrivedAt: newItem.arrived_at || 'Chegou agora',
    notes: newItem.notes || ''
  };

  const res = await authFetch(`${API_BASE}/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemToSave)
  });
  if (!res.ok) {
    throw new Error('Falha ao adicionar item à fila no Supabase');
  }

  return getQueueFromSupabase();
}

export async function updateQueueStatusInSupabase(id: string, status: 'waiting' | 'in_chair' | 'completed'): Promise<WaitingQueueItem[]> {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const res = await authFetch(`${API_BASE}/queue/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status,
      ...(status === 'in_chair' ? { startedAt: now } : {}),
      ...(status === 'completed' ? { completedAt: now } : {})
    })
  });
  if (!res.ok) {
    throw new Error('Falha ao atualizar status da fila no Supabase');
  }

  return getQueueFromSupabase();
}

export async function removeFromQueueInSupabase(id: string): Promise<WaitingQueueItem[]> {
  const res = await authFetch(`${API_BASE}/queue/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Falha ao remover item da fila no Supabase');
  }

  return getQueueFromSupabase();
}

export function subscribeToAppointmentsRealtime(onUpdate: (appointments: Appointment[]) => void) { return () => {}; }
export async function seedSupabaseDatabase(): Promise<{ success: boolean; message: string }> { return { success: true, message: 'Seeded in server' }; }

export async function fetchProductsFromSupabase(): Promise<ProductItem[]> {
  try {
    const res = await authFetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Falha ao buscar produtos do Supabase');
    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: Number(p.price),
      cost_price: Number(p.costPrice),
      stock_quantity: p.stockQuantity,
      min_stock_alert: p.minStockAlert,
      commission_percentage: p.commissionPercentage,
      image_url: p.imageUrl
    }));
  } catch (err) {
    console.error('Erro ao buscar produtos do Supabase:', err);
    return [];
  }
}

export async function saveProductInSupabase(product: ProductItem, isUpdate?: boolean): Promise<ProductItem[]> {
  const method = isUpdate ? 'PUT' : 'POST';
  const url = isUpdate ? `${API_BASE}/products/${product.id}` : `${API_BASE}/products`;
  
  const res = await authFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price.toString(),
      costPrice: product.cost_price.toString(),
      stockQuantity: product.stock_quantity,
      minStockAlert: product.min_stock_alert,
      commissionPercentage: product.commission_percentage,
      imageUrl: product.image_url
    })
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar produto no Supabase');
  }
  return fetchProductsFromSupabase();
}

export async function deleteProductInSupabase(id: string): Promise<ProductItem[]> {
  const res = await authFetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Falha ao deletar produto no Supabase');
  }
  return fetchProductsFromSupabase();
}

export async function saveProfessionalInSupabase(barber: Professional, isUpdate?: boolean): Promise<Professional[]> {
  const method = isUpdate ? 'PUT' : 'POST';
  const url = isUpdate ? `${API_BASE}/professionals/${barber.id}` : `${API_BASE}/professionals`;
  
  const res = await authFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: barber.id,
      name: barber.name,
      nickname: barber.nickname,
      roleTitle: barber.role,
      rating: barber.rating.toString(),
      reviewsCount: barber.reviews_count,
      photoUrl: barber.photo_url,
      specialties: barber.specialties,
      commissionRate: barber.commission_rate.toString(),
      workingHours: barber.working_hours,
      isActive: barber.is_active ?? true
    })
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar profissional no Supabase');
  }
  return fetchProfessionalsFromSupabase(true);
}

export async function deleteProfessionalInSupabase(id: string): Promise<Professional[]> {
  const res = await authFetch(`${API_BASE}/professionals/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Falha ao deletar profissional no Supabase');
  }
  return fetchProfessionalsFromSupabase(true);
}

export async function saveServiceInSupabase(service: ServiceItem, isUpdate?: boolean): Promise<ServiceItem[]> {
  const method = isUpdate ? 'PUT' : 'POST';
  const url = isUpdate ? `${API_BASE}/services/${service.id}` : `${API_BASE}/services`;
  
  const res = await authFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: service.id,
      categorySlug: service.category_id.replace('cat_', ''),
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      durationMinutes: service.duration_minutes,
      isCombo: service.is_combo || false,
      originalPrice: service.original_price?.toString(),
      discountPercentage: service.discount_percentage,
      isPopular: service.popular || false,
      imageUrl: service.image_url,
      galleryUrls: service.gallery_urls || []
    })
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar serviço no Supabase');
  }
  return fetchServicesFromSupabase(true);
}

export async function deleteServiceInSupabase(id: string): Promise<ServiceItem[]> {
  const res = await authFetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Falha ao deletar serviço no Supabase');
  }
  return fetchServicesFromSupabase(true);
}

export async function fetchScheduleBlocks(): Promise<ScheduleBlock[]> {
  try {
    const res = await authFetch(`${API_BASE}/schedule-blocks`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((b: any) => ({
      id: b.id,
      professional_id: b.professionalId || b.professional_id,
      date: b.date,
      start_time: b.startTime || b.start_time,
      end_time: b.endTime || b.end_time,
      reason: b.reason || 'Bloqueio de Agenda'
    })) : [];
  } catch (err) {
    console.error('Erro ao buscar bloqueios:', err);
    return [];
  }
}

export async function addScheduleBlock(block: Omit<ScheduleBlock, 'id'>): Promise<ScheduleBlock[]> {
  const newBlock = {
    id: `blk_${Date.now()}`,
    professionalId: block.professional_id,
    date: block.date,
    startTime: block.start_time,
    endTime: block.end_time,
    reason: block.reason
  };
  await authFetch(`${API_BASE}/schedule-blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newBlock)
  });
  return fetchScheduleBlocks();
}

export async function deleteScheduleBlock(id: string): Promise<ScheduleBlock[]> {
  await authFetch(`${API_BASE}/schedule-blocks/${id}`, { method: 'DELETE' });
  return fetchScheduleBlocks();
}

export interface CashTransactionItem {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash';
  date: string;
  status: 'completed' | 'pending';
  professionalName?: string;
  notes?: string;
}

export async function fetchCashTransactionsFromSupabase(): Promise<CashTransactionItem[]> {
  try {
    const res = await authFetch(`${API_BASE}/cash-transactions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((t: any) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      category: t.category,
      paymentMethod: t.paymentMethod || t.payment_method,
      date: t.date,
      status: t.status,
      professionalName: t.professionalName || t.professional_name,
      notes: t.notes
    })) : [];
  } catch (err) {
    console.error('Erro ao buscar lançamentos financeiros:', err);
    return [];
  }
}

export async function saveCashTransactionInSupabase(tx: CashTransactionItem, isUpdate?: boolean): Promise<CashTransactionItem[]> {
  const method = isUpdate ? 'PUT' : 'POST';
  const url = isUpdate ? `${API_BASE}/cash-transactions/${tx.id}` : `${API_BASE}/cash-transactions`;

  await authFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: tx.id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount.toString(),
      category: tx.category,
      paymentMethod: tx.paymentMethod,
      date: tx.date,
      status: tx.status,
      professionalName: tx.professionalName,
      notes: tx.notes
    })
  });
  return fetchCashTransactionsFromSupabase();
}

export async function deleteCashTransactionInSupabase(id: string): Promise<CashTransactionItem[]> {
  await authFetch(`${API_BASE}/cash-transactions/${id}`, { method: 'DELETE' });
  return fetchCashTransactionsFromSupabase();
}

// =====================================
// Landing Page Config Services
// =====================================

export interface DifferentialItem {
  id: string;
  iconName: string;
  label: string;
  strokeColor: string;
  bgColor: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
}

export interface LandingPageConfig {
  hero: {
    brandPrefix: string;
    brandSuffix: string;
    ratingBadgeText: string;
    titleLine1: string;
    titleHighlight: string;
    titleLine2: string;
    subtitle: string;
    ctaButtonText: string;
    bgImageUrl: string;
    statNextSlot: string;
    statStatus: string;
    statAvgTime: string;
  };
  differentialsSection: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    items: DifferentialItem[];
  };
  gallerySection: {
    eyebrow: string;
    title: string;
    images: GalleryItem[];
    promoTitle: string;
    promoSubtitle: string;
  };
  testimonialsSection: {
    eyebrow: string;
    title: string;
    items: TestimonialItem[];
  };
  locationSection: {
    eyebrow: string;
    title: string;
    address: string;
    hoursWeekday: string;
    hoursSaturday: string;
    hoursSunday: string;
    mapsQuery: string;
    whatsappNumber: string;
    whatsappMessage: string;
    mapImageUrl: string;
  };
  ctaSection: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    buttonOnlineText: string;
    buttonWhatsappText: string;
    copyrightText: string;
  };
}

export const DEFAULT_LANDING_PAGE_CONFIG: LandingPageConfig = {
  hero: {
    brandPrefix: 'NAVO',
    brandSuffix: 'PREMIUM',
    ratingBadgeText: '4.9 · 1.2k avaliações',
    titleLine1: 'Seu melhor',
    titleHighlight: 'visual',
    titleLine2: 'começa aqui.',
    subtitle: 'Agende online, chegue na hora certa e saia renovado. Sem filas, sem espera, sem complicação.',
    ctaButtonText: 'Agendar meu horário',
    bgImageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    statNextSlot: '14:30',
    statStatus: 'Aberto',
    statAvgTime: '30 min'
  },
  differentialsSection: {
    eyebrow: 'POR QUE A NAVO',
    title: 'Feito para você',
    titleHighlight: 'relaxar',
    items: [
      { id: 'diff_1', iconName: 'User', label: 'Profissionais experientes', strokeColor: '#b89060', bgColor: '#f5eedc' },
      { id: 'diff_2', iconName: 'Snowflake', label: 'Ambiente climatizado', strokeColor: '#80b6c6', bgColor: '#e3f4f8' },
      { id: 'diff_3', iconName: 'Coffee', label: 'Café cortesia', strokeColor: '#9e795a', bgColor: '#f5efe9' },
      { id: 'diff_4', iconName: 'Wifi', label: 'Wi-Fi gratuito', strokeColor: '#71a67a', bgColor: '#e6f5ea' },
      { id: 'diff_5', iconName: 'Car', label: 'Estacionamento próprio', strokeColor: '#9a9bc4', bgColor: '#edeefc' },
      { id: 'diff_6', iconName: 'Clock', label: 'Horário marcado', strokeColor: '#c1877f', bgColor: '#faece9' }
    ]
  },
  gallerySection: {
    eyebrow: 'GALERIA',
    title: 'Cortes reais',
    images: [
      { id: 'gal_1', src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop', title: 'Fade Moderno' },
      { id: 'gal_2', src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop', title: 'Barboterapia' },
      { id: 'gal_3', src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop', title: 'Espaço Premium' },
      { id: 'gal_4', src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop', title: 'Acabamento' },
      { id: 'gal_5', src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=600&auto=format&fit=crop', title: 'Café & Tesoura' },
      { id: 'gal_6', src: 'https://images.unsplash.com/photo-1593728612741-2461ccce8fdb?q=80&w=600&auto=format&fit=crop', title: 'Acabamento Mestre' }
    ],
    promoTitle: 'Detalhes que fazem toda a diferença.',
    promoSubtitle: 'Cortes precisos, barba bem desenhada e produtos de excelência.'
  },
  testimonialsSection: {
    eyebrow: 'DEPOIMENTOS',
    title: 'Quem já passou por aqui',
    items: [
      {
        id: 'test_1',
        name: 'Rafael M.',
        rating: 5,
        date: '10 de Julho, 2026',
        text: 'Melhor barbearia da cidade. Atendimento impecável e resultado sempre perfeito.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      },
      {
        id: 'test_2',
        name: 'Lucas S.',
        rating: 5,
        date: '02 de Agosto, 2026',
        text: 'Ambiente sensacional e um corte de primeira. Recomendo demais!',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
      },
      {
        id: 'test_3',
        name: 'Felipe C.',
        rating: 5,
        date: '28 de Julho, 2026',
        text: 'Experiência incrível! O café é ótimo e os profissionais sabem exatamente o que estão fazendo.',
        avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=150'
      }
    ]
  },
  locationSection: {
    eyebrow: 'LOCALIZAÇÃO',
    title: 'Onde estamos',
    address: 'Rua Augusta, 1420 · Jardins, São Paulo',
    hoursWeekday: '09:00 - 22:00',
    hoursSaturday: '09:00 - 20:00',
    hoursSunday: 'Fechado',
    mapsQuery: 'Rua Augusta 1420 Jardins Sao Paulo',
    whatsappNumber: '5511999998888',
    whatsappMessage: 'Olá! Gostaria de agendar um horário na Navo Premium.',
    mapImageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop'
  },
  ctaSection: {
    titleLine1: 'Pronto para o seu',
    titleLine2: 'novo visual?',
    subtitle: 'Garanta seu horário em segundos e viva a experiência Navo Premium.',
    buttonOnlineText: 'Agendar Online',
    buttonWhatsappText: 'Atendimento WhatsApp',
    copyrightText: '© 2026 Navo Premium. Todos os direitos reservados.'
  }
};

export async function fetchLandingPageConfigFromSupabase(): Promise<LandingPageConfig> {
  try {
    const res = await fetch(`${API_BASE}/site-settings/landing_page_config`);
    if (!res.ok) return DEFAULT_LANDING_PAGE_CONFIG;
    const data = await res.json();
    if (!data || typeof data !== 'object') return DEFAULT_LANDING_PAGE_CONFIG;
    
    return {
      hero: { ...DEFAULT_LANDING_PAGE_CONFIG.hero, ...(data.hero || {}) },
      differentialsSection: { ...DEFAULT_LANDING_PAGE_CONFIG.differentialsSection, ...(data.differentialsSection || {}) },
      gallerySection: { ...DEFAULT_LANDING_PAGE_CONFIG.gallerySection, ...(data.gallerySection || {}) },
      testimonialsSection: { ...DEFAULT_LANDING_PAGE_CONFIG.testimonialsSection, ...(data.testimonialsSection || {}) },
      locationSection: { ...DEFAULT_LANDING_PAGE_CONFIG.locationSection, ...(data.locationSection || {}) },
      ctaSection: { ...DEFAULT_LANDING_PAGE_CONFIG.ctaSection, ...(data.ctaSection || {}) }
    };
  } catch (err) {
    console.error('Erro ao buscar configuração da landing page:', err);
    return DEFAULT_LANDING_PAGE_CONFIG;
  }
}

export async function saveLandingPageConfigInSupabase(config: LandingPageConfig): Promise<LandingPageConfig> {
  const res = await authFetch(`${API_BASE}/site-settings/landing_page_config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar configuração da landing page no servidor');
  }
  return config;
}

