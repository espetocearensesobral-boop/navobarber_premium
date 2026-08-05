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

export async function saveProductInSupabase(product: ProductItem): Promise<ProductItem[]> {
  const isUpdate = product.id && !product.id.startsWith('prod_temp');
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

export async function saveProfessionalInSupabase(barber: Professional): Promise<Professional[]> {
  const isUpdate = barber.id && !barber.id.startsWith('prof_temp');
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

export async function saveServiceInSupabase(service: ServiceItem): Promise<ServiceItem[]> {
  const isUpdate = service.id && !service.id.startsWith('srv_temp');
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

export async function fetchScheduleBlocks(): Promise<ScheduleBlock[]> { return []; }
export async function addScheduleBlock(block: Omit<ScheduleBlock, 'id'>): Promise<ScheduleBlock[]> { return []; }
export async function deleteScheduleBlock(id: string): Promise<ScheduleBlock[]> { return []; }

