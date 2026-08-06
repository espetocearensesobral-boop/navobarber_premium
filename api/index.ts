import crypto from 'crypto';
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, or, desc, like, sql } from "drizzle-orm";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import * as schema from "../src/db/schema.js";
import rateLimit from "express-rate-limit";
import { z } from "zod";

// =====================================================================
// FUNÇÃO UTILITÁRIA: Mensagens amigáveis para o usuário
// =====================================================================
const userErrors = {
  dbDisconnected: 'Serviço temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
  unauthorized: 'Sessão expirada. Faça login novamente.',
  forbidden: 'Você não tem permissão para realizar esta ação.',
  notFound: 'Recurso não encontrado.',
  conflict: 'Conflito de dados. Verifique as informações e tente novamente.',
  validation: 'Dados inválidos. Verifique os campos e tente novamente.',
  generic: 'Ocorreu um erro inesperado. Nossa equipe já foi notificada.',
};

// Helper para tratar erros de forma consistente
const handleError = (res: any, e: any, context: string) => {
  console.error(`[API] Erro em ${context}:`, e);
  
  // Erros conhecidos do Postgres
  const pgErrors: Record<string, { status: number; message: string }> = {
    '23505': { status: 409, message: 'Registro já existe ou conflito de dados.' },
    '23503': { status: 400, message: 'Operação não permitida devido a dependências.' },
    '23502': { status: 400, message: 'Campos obrigatórios não preenchidos.' },
    '22P02': { status: 400, message: 'Formato de dado inválido.' },
  };

  if (e && e.code && pgErrors[e.code]) {
    return res.status(pgErrors[e.code].status).json({ error: pgErrors[e.code].message });
  }

  // Erro genérico
  return res.status(500).json({ error: userErrors.generic });
};

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/signup requests
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

const bookingSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
  services: z.array(z.any()).optional().default([]),
  paymentMethod: z.string().optional()
}).passthrough();



// Função utilitária para limpar e padronizar telefones
const sanitizePhone = (phone: string | undefined | null): string => {
  if (!phone) return '';
  // 1. Remove tudo que não for dígito
  let clean = phone.replace(/\D/g, '');
  // 2. Se for um número brasileiro válido (10 ou 11 dígitos), adiciona o 55
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  return clean;
};

// Função para gerar código de reserva único
const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BRX-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Função auxiliar para comparar números de telefone
function matchPhoneNumbers(phone1: string, phone2: string): boolean {
  if (!phone1 || !phone2) return false;
  
  const digits1 = phone1.replace(/\D/g, '');
  const digits2 = phone2.replace(/\D/g, '');
  
  if (!digits1 || !digits2) return false;
  if (digits1 === digits2) return true;

  // Normalizar: remover código do país (55)
  let norm1 = digits1;
  if (norm1.length >= 12 && norm1.startsWith('55')) {
    norm1 = norm1.slice(2);
  } else if (norm1.length === 11 && norm1.startsWith('55') && !norm1.startsWith('559')) {
    norm1 = norm1.slice(2);
  }

  let norm2 = digits2;
  if (norm2.length >= 12 && norm2.startsWith('55')) {
    norm2 = norm2.slice(2);
  } else if (norm2.length === 11 && norm2.startsWith('55') && !norm2.startsWith('559')) {
    norm2 = norm2.slice(2);
  }

  if (norm1 === norm2) return true;

  // Se um for de 10 dígitos (sem 9º dígito extra) e o outro de 11 dígitos (com 9º dígito)
  if (Math.abs(norm1.length - norm2.length) === 1 && norm1.length >= 10 && norm2.length >= 10) {
    if (norm1.slice(0, 2) === norm2.slice(0, 2) && norm1.slice(-8) === norm2.slice(-8)) {
      return true;
    }
  }

  // Comparação de sufixos (últimos 8 e 9 dígitos)
  if (norm1.length >= 8 && norm2.length >= 8) {
    if (norm1.slice(-9) === norm2.slice(-9)) return true;
    if (norm1.slice(-8) === norm2.slice(-8)) {
      if (norm1.length <= 9 || norm2.length <= 9) return true;
      if (norm1.slice(0, 2) === norm2.slice(0, 2)) return true;
    }
    if (norm1.endsWith(norm2) || norm2.endsWith(norm1)) return true;
  }
  
  return false;
}

const app = express();
app.set("trust proxy", 1);

app.use((req, res, next) => {
  const allowedOrigins = [
    'https://navopremium.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is not defined. Using auto-generated secure key in memory.");
}

if (!process.env.DATABASE_URL && !process.env.SQL_HOST) {
  console.warn("NOTICE: DATABASE_URL or SQL_HOST not defined. Ensure Supabase credentials are configured.");
}

const validateOrigin = (req: any, res: any, next: any) => {
  const allowedOrigins = [
    'https://navopremium.vercel.app',
    'https://www.navopremium.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  
  const origin = req.headers.origin || req.headers.referer;
  
  // Para operações sensíveis (POST/PUT/PATCH/DELETE), valida origem
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!origin || !allowedOrigins.some(o => origin.includes(o))) {
      console.warn(`[SECURITY] Blocked request from origin: ${origin}`);
      return res.status(403).json({ error: 'Origem não autorizada' });
    }
  }
  
  next();
};
app.use(validateOrigin);

const sensitiveOpsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas operações sensíveis. Aguarde alguns minutos.' }
});

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false, frameguard: false }));
app.use("/api/", apiLimiter);
app.use("/api", async (req, res, next) => {
  // Rotas públicas que não precisam de banco
  const publicRoutes = ['/whatsapp/status', '/services'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // Aguarda a inicialização do banco (se ainda estiver em andamento)
  if (!isDbConnected && dbReadyPromise) {
    try {
      await dbReadyPromise;
    } catch (e) {
      // Silencioso - o erro já foi logado em initializeDb()
    }
  }

  // Se ainda não conectou, tenta UMA reconexão rápida antes de falhar
  if (!isDbConnected || !db) {
    try {
      await initializeDb();
    } catch (e) {
      // Ignora - vamos retornar erro amigável abaixo
    }
  }

  // Verificação final
  if (!isDbConnected || !db) {
    return res.status(503).json({ 
      error: userErrors.dbDisconnected 
    });
  }

  next();
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.use(cookieParser());

const setAuthCookie = (res: any, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// =====================================
// CORS CONFIGURATION (ANTES DE TUDO)
// =====================================
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://navopremium.vercel.app',
    'https://www.navopremium.vercel.app',
    'https://navobarber-premium.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
    res.setHeader('Access-Control-Expose-Headers', 'X-Auth-Token');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Auth Middleware
const requireAuth = async (req: any, res: any, next: any) => {
  let token = null;
  
  // Apenas 2 fontes seguras (removido query param)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Sessão expirada. Faça login novamente.' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Sessão expirada. Faça login novamente.' 
    });
  }
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito apenas para administradores' });
  }
  next();
};

const optionalAuth = (req: any, res: any, next: any) => {
  let token = null;
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      req.user = { id: 'usr_guest', role: 'guest' };
    }
  } else {
    req.user = { id: 'usr_guest', role: 'guest' };
  }
  next();
};


// =====================================================================
// INICIALIZAÇÃO DO BANCO COM RETRY (resiliente a cold starts)
// =====================================================================
let db: any = null;
let isDbConnected = false;
let dbInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

async function initializeDb(): Promise<void> {
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('[API] DATABASE_URL não definida nas variáveis de ambiente.');
      db = null;
      isDbConnected = false;
      return;
    }

    if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
      console.error('[API] DATABASE_URL com formato inválido.');
      db = null;
      isDbConnected = false;
      return;
    }

    const queryClient = postgres(connectionString, { 
      max: 10, 
      ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : undefined,
      connect_timeout: 10, // Timeout de 10s para evitar travamento no cold start
    });
    
    await queryClient`SELECT 1`;
    db = drizzle(queryClient, { schema });
    isDbConnected = true;
    dbInitAttempts = 0; // Reset contador de tentativas
    console.log('[API] ✅ Conectado ao Banco de Dados Supabase com sucesso.');

    // Migration automática para novas colunas
    try {
      await queryClient`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_code text;`;
    } catch (migErr: any) {
      console.warn('[API] Aviso na migração de coluna booking_code:', migErr.message);
    }

    // Seed automático removido - use POST /api/seed manualmente quando necessário

  } catch (err: any) {
    console.error('[API] ❌ Falha ao conectar ao banco:', err.message);
    db = null;
    isDbConnected = false;
    
    // Retry com backoff exponencial (útil para cold starts no Vercel)
    if (dbInitAttempts < MAX_INIT_ATTEMPTS) {
      dbInitAttempts++;
      const delay = dbInitAttempts * 1000; // 1s, 2s, 3s
      console.log(`[API] Tentativa ${dbInitAttempts}/${MAX_INIT_ATTEMPTS} de reconexão em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return initializeDb(); // Retry recursivo
    }
  }
}

const dbReadyPromise = initializeDb();


// Setup database migration & seed
app.post("/api/seed", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const result = await seedDatabase();
    res.json({ success: true, message: "Banco de dados alimentado com dados de teste com sucesso!", details: result });
  } catch (e: any) {
    console.error("Error seeding database:", e);
    res.status(500).json({ error: "Falha ao popular o banco de dados", details: e.message });
  }
});

app.post("/api/migrate", requireAuth, async (req: any, res) => { if(req.user.role !== "admin") return res.status(403).json({ error: "Access denied" }); 
  try {
    const { runMigrations } = await import("./setup.js");
    await runMigrations();
    res.json({ success: true, message: "Database tables created successfully!" });
  } catch (e: any) {
    
    const userMessage = e.status === 401 || e.status === 403 
      ? 'Não foi possível autenticar com o assistente inteligente. Verifique as credenciais.'
      : 'Desculpe, o assistente inteligente está indisponível no momento. Tente novamente mais tarde.';
    res.status(500).json({ error: userMessage, details: e.message });

  }
});

// --- WhatsApp Notification Service (Baileys) ---
import whatsappRouter, { sendWhatsAppMessage } from './whatsapp.js';
app.use('/api/whatsapp', whatsappRouter);

// =====================================
// Guest Appointments Lookup API (2 Etapas)
// =====================================

// GET /api/appointments/lookup/step1 — Verifica se há agendamentos ativos para o telefone
app.get("/api/appointments/lookup/step1", async (req: any, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Informe o telefone.' });
    }

    const inputPhone = phone.toString().trim();
    const digitsOnly = inputPhone.replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 8) {
      return res.status(400).json({ error: 'Telefone inválido. Digite DDD + número.' });
    }

    const allApts = await db
      .select()
      .from(schema.appointments)
      .orderBy(desc(schema.appointments.createdAt))
      .limit(500);

    const appointments = allApts.filter((apt: any) => 
      apt.status !== 'cancelled' && matchPhoneNumbers(apt.clientPhone, inputPhone)
    );

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum agendamento encontrado para este telefone.',
        requiresCode: false
      });
    }

    return res.json({
      success: true,
      requiresCode: true,
      count: appointments.length,
      message: appointments.length === 1 
        ? 'Encontramos 1 agendamento. Digite o código da reserva para acessar.'
        : `Encontramos ${appointments.length} agendamentos. Digite o código da reserva para acessar.`
    });

  } catch (e: any) {
    console.error('[API] Erro em lookup/step1:', e);
    return res.status(500).json({ error: 'Erro ao buscar. Tente novamente.' });
  }
});

// GET /api/appointments/lookup/step2 — Valida código e retorna detalhes do agendamento
app.get("/api/appointments/lookup/step2", async (req: any, res) => {
  try {
    const { phone, code } = req.query;

    if (!phone || !code) {
      return res.status(400).json({ 
        error: 'Informe o telefone e o código da reserva.' 
      });
    }

    const inputPhone = phone.toString().trim();
    const cleanCode = code.toString().toUpperCase().trim();

    const allApts = await db
      .select()
      .from(schema.appointments)
      .orderBy(desc(schema.appointments.createdAt))
      .limit(500);

    const candidates = allApts.filter((apt: any) => 
      matchPhoneNumbers(apt.clientPhone, inputPhone)
    );

    const appointment = candidates.find((apt: any) => {
      const aptCode = (apt.bookingCode || apt.id || '').toUpperCase();
      return aptCode === cleanCode || aptCode.endsWith(cleanCode) || cleanCode.endsWith(aptCode) || apt.id.toUpperCase().includes(cleanCode);
    });

    if (!appointment) {
      return res.status(404).json({ 
        error: 'Código de reserva inválido. Verifique e tente novamente.' 
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Este agendamento já foi cancelado.' 
      });
    }

    return res.json({
      success: true,
      appointment: {
        id: appointment.id,
        bookingCode: appointment.bookingCode || appointment.id,
        clientName: appointment.clientName,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        professionalName: appointment.professionalName,
        status: appointment.status,
        services: appointment.services,
        finalAmount: appointment.finalAmount,
        paymentMethod: appointment.paymentMethod,
      }
    });

  } catch (e: any) {
    console.error('[API] Erro em lookup/step2:', e);
    return res.status(500).json({ error: 'Erro ao buscar reserva. Tente novamente.' });
  }
});

// PATCH /api/appointments/lookup/cancel — Cancela agendamento via telefone + código
app.patch("/api/appointments/lookup/cancel", sensitiveOpsLimiter, async (req: any, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Informe telefone e código da reserva.' });
    }

    const inputPhone = phone.toString().trim();
    const cleanCode = code.toString().toUpperCase().trim();

    const allApts = await db
      .select()
      .from(schema.appointments)
      .orderBy(desc(schema.appointments.createdAt))
      .limit(500);

    const candidates = allApts.filter((apt: any) => 
      matchPhoneNumbers(apt.clientPhone, inputPhone)
    );

    const appointment = candidates.find((apt: any) => {
      const aptCode = (apt.bookingCode || apt.id || '').toUpperCase();
      return aptCode === cleanCode || aptCode.endsWith(cleanCode) || cleanCode.endsWith(aptCode) || apt.id.toUpperCase().includes(cleanCode);
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Reserva não encontrada. Verifique os dados.' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Este agendamento já foi cancelado.' });
    }

    await db.update(schema.appointments)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(schema.appointments.id, appointment.id));

    await db.update(schema.waitingQueue)
      .set({ status: 'abandoned', updatedAt: new Date() })
      .where(eq(schema.waitingQueue.appointmentId, appointment.id));

    const msg = `❌ *BARBERX PREMIUM*\n\n` +
      `Olá, *${appointment.clientName}*!\n\n` +
      `Seu agendamento para *${appointment.date}* às *${appointment.timeSlot}* foi *CANCELADO*.\n\n` +
      `Ficamos à disposição para remarcar quando desejar! 💈`;
    
    sendWhatsAppMessage(appointment.clientPhone || inputPhone, msg).catch(() => {});

    return res.json({ 
      success: true, 
      message: 'Agendamento cancelado com sucesso.' 
    });

  } catch (e: any) {
    console.error('[API] Erro em lookup/cancel:', e);
    return res.status(500).json({ error: 'Erro ao cancelar. Tente novamente.' });
  }
});

// =====================================
// Appointments API
// =====================================
app.get("/api/appointments", optionalAuth, async (req: any, res) => {
  try {
    const userRole = req.user?.role || 'guest';
    const userId = req.user?.id || '';
    const isAdmin = userRole === 'admin';
    const isGuest = userRole === 'guest' || !userId || userId === 'usr_guest' || userId.startsWith('guest_');

    const searchPhone = (req.query.phone || req.query.clientPhone || '').toString().trim();

    const dbApts = await db
      .select()
      .from(schema.appointments)
      .orderBy(desc(schema.appointments.createdAt))
      .limit(500);

    // Se a requisição passou telefone para busca (ex: consulta do cliente por telefone)
    if (searchPhone) {
      const filtered = dbApts.filter(a => matchPhoneNumbers(a.clientPhone, searchPhone));
      return res.json(filtered);
    }

    // Se for administrador sem telefone de busca, retorna todos
    if (isAdmin) {
      return res.json(dbApts);
    }

    // Se for usuário autenticado (não convidado)
    if (!isGuest && userId) {
      let userPhone = req.user?.phone || '';
      if (!userPhone) {
        const dbUser = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, userId) });
        if (dbUser) userPhone = dbUser.phone || '';
      }
      const filtered = dbApts.filter(a => 
        a.clientId === userId || (userPhone && matchPhoneNumbers(a.clientPhone, userPhone))
      );
      return res.json(filtered);
    }

    // Se for visitante sem parâmetro de telefone
    return res.json([]);
  } catch (e: any) {
    console.error('[API] GET /api/appointments Error:', e);
    return handleError(res, e, req.path);
  }
});

app.post("/api/appointments", optionalAuth, async (req: any, res) => {
  try {
    const data = req.body;
    
    // LGPD & Validation
    try {
      bookingSchema.parse(data);
    } catch (validationError) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationError });
    }

    // 1. Conflict Check (Server-side)
    const professionalId = data.professionalId || data.professional_id;
    const date = data.date;
    const timeSlot = data.timeSlot || data.time_slot;

    if (!professionalId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Profissional, data e horário são obrigatórios' });
    }

    const existingApt = await db.query.appointments.findFirst({
      where: (apt: any, { and, eq, ne }: any) => and(
        eq(apt.professionalId, professionalId),
        eq(apt.date, date),
        eq(apt.timeSlot, timeSlot),
        ne(apt.status, 'cancelled')
      )
    });

    if (existingApt && existingApt.id !== data.id) {
      return res.status(409).json({ error: 'Este horário já está reservado para este profissional.' });
    }

    let resolvedProfessionalId = professionalId;
    let resolvedProfessionalName = data.professionalName || data.professional_name || 'Carlos Silva';

    if (resolvedProfessionalId === 'prof_any') {
      const allProfs = await db.query.professionals.findMany();
      if (allProfs.length > 0) {
        // Try to find one without conflicts
        let chosenProf = null;
        for (const prof of allProfs) {
          const conflict = await db.query.appointments.findFirst({
            where: (apt: any, { and, eq, ne }: any) => and(
              eq(apt.professionalId, prof.id),
              eq(apt.date, date),
              eq(apt.timeSlot, timeSlot),
              ne(apt.status, 'cancelled')
            )
          });
          if (!conflict) {
            chosenProf = prof;
            break;
          }
        }
        
        if (!chosenProf) {
          return res.status(409).json({ error: 'Nenhum profissional disponível para este horário. Por favor, escolha outro.' });
        }
        
        resolvedProfessionalId = chosenProf.id;
        resolvedProfessionalName = chosenProf.name;
      }
    }

    // Calculate total price from services on the server side
    let calculatedTotal = 0;
    let calculatedDuration = 0;
    
    let allServices = await db.query.services.findMany();

    if (data.services && Array.isArray(data.services)) {
      for (const reqSvc of data.services) {
        const srvId = typeof reqSvc === 'string' ? reqSvc : reqSvc.id;
        const srv = allServices.find((s: any) => s.id === srvId);
        if (srv) {
          calculatedTotal += Number(srv.price || 0);
          calculatedDuration += Number(srv.durationMinutes || srv.duration_minutes || 0);
        }
      }
    }

    // Default values if no services matched
    if (calculatedTotal === 0 && data.originalAmount) {
      calculatedTotal = Number(data.originalAmount ?? data.original_amount ?? 0);
    }
    
    const originalAmount = calculatedTotal;
    const discountAmount = Number(data.discountAmount ?? data.discount_amount ?? 0);
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    
    const isAdmin = req.user && req.user.role === 'admin';
    let clientId = data.clientId || data.client_id || (req.user?.id || 'guest');
    let clientName = data.clientName || data.client_name || 'Cliente';
    let clientPhone = sanitizePhone(data.clientPhone || data.client_phone || '');
    
    // Ensure client profile exists
    if (isDbConnected && db) {
      const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, clientId) });
      if (!profile) {
        try {
          await db.insert(schema.profiles).values({
            id: clientId,
            name: clientName,
            email: `${clientId}@guest.barberx.app`,
            phone: clientPhone,
            role: 'client',
            loyaltyPoints: 0,
            loyaltyTier: 'Bronze'
          });
        } catch (e) {
          console.warn('[API] Could not create guest profile:', e);
        }
      } else {
        if (!isAdmin && req.user && req.user.id && req.user.role !== 'guest' && req.user.id !== 'usr_guest' && !req.user.id.startsWith('guest_')) {
          if (profile.name) clientName = profile.name;
          if (!clientPhone && profile.phone) clientPhone = profile.phone;
        }
      }
    }

    const newApt = {
      id: data.id || `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientId,
      clientName,
      clientPhone,
      professionalId: resolvedProfessionalId,
      professionalName: resolvedProfessionalName,
      date,
      timeSlot,
      status: data.status || 'confirmed',
      totalDurationMinutes: calculatedDuration > 0 ? calculatedDuration : Number(data.totalDurationMinutes || data.total_duration_minutes || 30),
      originalAmount: originalAmount.toString(),
      discountAmount: discountAmount.toString(),
      finalAmount: finalAmount.toString(),
      paymentMethod: data.paymentMethod || data.payment_method || 'PIX',
      bookingCode: data.bookingCode || generateBookingCode(),
      services: data.services || [],
      createdAt: data.createdAt || new Date().toISOString()
    };

    // 2. Atomic Save (Transaction)
    if (isDbConnected && db && typeof db.transaction === 'function') {
      try {
        await db.transaction(async (tx: any) => {
          const dbApt = {
            ...newApt,
            createdAt: newApt.createdAt ? new Date(newApt.createdAt) : new Date()
          };
          const { createdAt, ...updateFields } = dbApt;
          await tx.insert(schema.appointments).values(dbApt).onConflictDoUpdate({
            target: schema.appointments.id,
            set: {
              ...updateFields,
              updatedAt: new Date()
            }
          });

          // Auto-feed waiting queue if appointment is for today
          const todayStr = new Date().toISOString().split('T')[0];
          if (newApt.date === todayStr && newApt.status !== 'cancelled') {
            const serviceTitle = Array.isArray(newApt.services) && newApt.services.length > 0
              ? (typeof newApt.services[0] === 'string' ? newApt.services[0] : (newApt.services[0].title || 'Atendimento BarberX'))
              : 'Atendimento BarberX';

            const queueItem = {
              id: `q_${newApt.id}`,
              appointmentId: newApt.id,
              clientId: newApt.clientId,
              clientName: newApt.clientName,
              professionalId: newApt.professionalId,
              serviceTitle,
              status: newApt.status === 'in_service' ? 'in_chair' : 'waiting',
              joinedAt: new Date(),
              estimatedWaitMinutes: 15
            };
            await tx.insert(schema.waitingQueue).values(queueItem).onConflictDoUpdate({
              target: schema.waitingQueue.id,
              set: queueItem
            });
          }
        });
      } catch (err: any) {
        const errMsg = err?.message || '';
        const causeMsg = err?.cause?.message || err?.cause?.constraint_name || '';
        const pgCode = err?.code || err?.cause?.code || '';
        const pgConstraint = err?.constraint || err?.cause?.constraint || '';
        const fullErr = `${errMsg} ${causeMsg} ${pgCode} ${pgConstraint}`;

        if (fullErr.includes('booking_conflict_idx') || fullErr.includes('23505') || pgCode === '23505') {
          return res.status(409).json({ error: 'Este horário já está reservado. Por favor, escolha outro.' });
        }
        
        console.error('[API] Atomic transaction failed:', err);

        if (fullErr.includes('appointments_client_id_fkey')) {
          return res.status(400).json({ error: 'Erro no perfil do cliente. Atualize a página e tente novamente.' });
        }
        if (fullErr.includes('appointments_professional_id_fkey')) {
          return res.status(400).json({ error: 'Profissional não encontrado.' });
        }

        return res.status(400).json({ error: 'Falha ao salvar agendamento no banco de dados. Por favor, tente novamente.' });
      }
    } else {
      // Fallback to non-transactional or mock insert
      const dbApt = {
        ...newApt,
        createdAt: newApt.createdAt ? new Date(newApt.createdAt) : new Date()
      };
      const { createdAt, ...updateFields } = dbApt;
      try {
        await db.insert(schema.appointments).values(dbApt).onConflictDoUpdate({
          target: schema.appointments.id,
          set: {
            ...updateFields,
            updatedAt: new Date()
          }
        });
      } catch (err: any) {
        const errMsg = err?.message || '';
        const causeMsg = err?.cause?.message || err?.cause?.constraint_name || '';
        const pgCode = err?.code || err?.cause?.code || '';
        const pgConstraint = err?.constraint || err?.cause?.constraint || '';
        const fullErr = `${errMsg} ${causeMsg} ${pgCode} ${pgConstraint}`;

        if (fullErr.includes('booking_conflict_idx') || fullErr.includes('23505') || pgCode === '23505') {
          return res.status(409).json({ error: 'Este horário já está reservado. Por favor, escolha outro.' });
        }
        
        console.error("[API] Fallback insert failed:", err);
        return res.status(400).json({ error: "Falha ao salvar agendamento no banco de dados. Por favor, tente novamente." });
      }

    }


    // Disparo de mensagem WhatsApp (Confirmação ou Cancelamento)
    let phone = newApt.clientPhone || '5511999999999';
    if (!newApt.clientPhone && newApt.clientId) {
      const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, newApt.clientId) });
      if (profile && profile.phone) phone = sanitizePhone(profile.phone);
    }

    // Garantir que o número tem o tamanho certo para o WhatsApp (mínimo 12 dígitos com o 55)
    if (!phone || phone.length < 12) {
      console.warn(`[WhatsApp] Número inválido para envio: ${phone}. Usando fallback.`);
      phone = '5511999999999'; 
    }
    if (newApt.status === 'cancelled') {
      const msg = `❌ *BARBERX PREMIUM*\n\nOlá, *${newApt.clientName || 'Cliente'}*!\nSeu agendamento para *${newApt.date}* às *${newApt.timeSlot}* foi *CANCELADO* com sucesso.\n\nFicamos à disposição para remarcar quando desejar! 💈`;
      sendWhatsAppMessage(phone, msg).catch(() => {});
    } else {
      const msg = `💈 *BARBERX PREMIUM*\n\nOlá, *${newApt.clientName || 'Cliente'}*!\n\nSeu agendamento foi *confirmado* com sucesso:\n\n🔑 *Código:* ${newApt.bookingCode || newApt.id}\n📅 *Data:* ${newApt.date}\n⏰ *Horário:* ${newApt.timeSlot}\n✂️ *Barbeiro:* ${newApt.professionalName || 'Profissional BarberX'}\n\n📍 *Local:* BarberX Premium - Rua dos Barões, 1420 - Jardins\n\nTe esperamos com o café pronto! ☕`;
      sendWhatsAppMessage(phone, msg).catch(() => {});
    }

    res.json(newApt);
  } catch (e: any) {
    console.error('Error in POST /api/appointments:', e);
    return handleError(res, e, req.path);
  }
});


app.post("/api/appointments/:id/review", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Avaliação inválida.' });
    }

    const dbApt = await db.query.appointments.findFirst({ where: eq(schema.appointments.id, id) });
    if (!dbApt) return res.status(404).json({ error: 'Agendamento não encontrado' });
    if (dbApt.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    if (dbApt.status !== 'completed') {
      return res.status(400).json({ error: 'Apenas agendamentos concluídos podem ser avaliados.' });
    }
    if (dbApt.isReviewed) {
      return res.status(400).json({ error: 'Este agendamento já foi avaliado.' });
    }

    const reviewId = 'rev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    await db.insert(schema.reviews).values({
      id: reviewId,
      appointmentId: id,
      professionalId: dbApt.professionalId,
      rating,
      comment
    });

    await db.update(schema.appointments).set({ 
      isReviewed: true,
      updatedAt: new Date() 
    }).where(eq(schema.appointments.id, id));

    // Optional: update professional rating logic can go here
    // for now we just return success

    res.json({ success: true });
  } catch (e: any) {
    console.error('Error in POST /api/appointments/:id/review:', e);
    return handleError(res, e, req.path);
  }
});

app.patch("/api/appointments/:id/cancel", sensitiveOpsLimiter, optionalAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    let updatedApt: any = null;
    const isAdmin = req.user?.role === 'admin';

    const dbApt = await db.query.appointments.findFirst({ where: eq(schema.appointments.id, id) });
    if (!dbApt) return res.status(404).json({ error: 'Agendamento não encontrado' });

    if (!isAdmin) {
      let userPhone = req.user?.phone;
      if (!userPhone && req.user?.id && req.user.id !== 'usr_guest') {
        const dbUser = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, req.user.id) });
        if (dbUser) userPhone = dbUser.phone;
      }

      const isOwner = dbApt.clientId === req.user?.id;
      const isPhoneMatch = userPhone && dbApt.clientPhone && 
        matchPhoneNumbers(userPhone, dbApt.clientPhone);
      
      const reqPhone = req.body.clientPhone || req.body.client_phone;
      const reqCode = req.body.bookingCode || req.body.booking_code;
      const isLookupMatch = reqPhone && dbApt.clientPhone && matchPhoneNumbers(reqPhone, dbApt.clientPhone) &&
                            reqCode && dbApt.bookingCode && reqCode === dbApt.bookingCode;

      const isPhoneReqMatch = reqPhone && dbApt.clientPhone && matchPhoneNumbers(reqPhone, dbApt.clientPhone);
      if (!isOwner && !isPhoneMatch && !isPhoneReqMatch) {
        return res.status(403).json({ error: 'Acesso negado: Você só pode cancelar o próprio agendamento' });
      }
    }

    await db.update(schema.appointments).set({ 
      status: 'cancelled', 
      cancellationReason: reason || 'Cancelado pelo cliente',
      updatedAt: new Date() 
    }).where(eq(schema.appointments.id, id));
    
    await db.update(schema.waitingQueue).set({
      status: 'abandoned',
      updatedAt: new Date()
    }).where(eq(schema.waitingQueue.appointmentId, id));
    
    updatedApt = { ...dbApt, status: 'cancelled', cancellationReason: reason };

    if (updatedApt) {
      let phone = updatedApt.clientPhone || '5511999999999';
      if (!updatedApt.clientPhone && updatedApt.clientId) {
        const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, updatedApt.clientId) });
        if (profile && profile.phone) phone = profile.phone;
      }
      const msg = `❌ *BARBERX PREMIUM*\n\nOlá, *${updatedApt.clientName || 'Cliente'}*!\nSeu agendamento para *${updatedApt.date}* às *${updatedApt.timeSlot}* foi *CANCELADO* com sucesso.\n\nFicamos à disposição para remarcar quando desejar! 💈`;

      sendWhatsAppMessage(phone, msg).catch(() => {});
    }

    res.json({ success: true, updated: updatedApt });
  } catch (e: any) {
    console.error('[API] Error canceling appointment:', e);
    return handleError(res, e, req.path);
  }
});

app.put("/api/appointments/:id", sensitiveOpsLimiter, optionalAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const isAdmin = req.user?.role === 'admin';

    const dbApt = await db.query.appointments.findFirst({ where: eq(schema.appointments.id, id) });
    if (!dbApt) return res.status(404).json({ error: 'Agendamento não encontrado' });

    if (!isAdmin) {
      let userPhone = req.user?.phone;
      if (!userPhone && req.user?.id && req.user.id !== 'usr_guest') {
        const dbUser = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, req.user.id) });
        if (dbUser) userPhone = dbUser.phone;
      }

      const isOwner = dbApt.clientId === req.user?.id;
      const isPhoneMatch = userPhone && dbApt.clientPhone && 
        matchPhoneNumbers(userPhone, dbApt.clientPhone);
      
      const reqPhone = req.body.clientPhone || req.body.client_phone;
      const reqCode = req.body.bookingCode || req.body.booking_code;
      const isLookupMatch = reqPhone && dbApt.clientPhone && matchPhoneNumbers(reqPhone, dbApt.clientPhone) &&
                            reqCode && dbApt.bookingCode && reqCode === dbApt.bookingCode;

      const isPhoneReqMatch = reqPhone && dbApt.clientPhone && matchPhoneNumbers(reqPhone, dbApt.clientPhone);
      if (!isOwner && !isPhoneMatch && !isPhoneReqMatch) {
        return res.status(403).json({ error: 'Acesso negado: Você só pode editar o próprio agendamento' });
      }
    }

    const newDate = data.date || dbApt.date;
    const newTimeSlot = data.timeSlot || data.time_slot || dbApt.timeSlot;
    const newProfessionalId = data.professionalId || data.professional_id || dbApt.professionalId;

    if (newDate !== dbApt.date || newTimeSlot !== dbApt.timeSlot || newProfessionalId !== dbApt.professionalId) {
      const conflict = await db.query.appointments.findFirst({
        where: (apt: any, { and, eq, ne }: any) => and(
          eq(apt.professionalId, newProfessionalId),
          eq(apt.date, newDate),
          eq(apt.timeSlot, newTimeSlot),
          ne(apt.status, 'cancelled'),
          ne(apt.id, id)
        )
      });

      if (conflict) {
        return res.status(409).json({ error: 'Este horário já está reservado para este profissional. Por favor, escolha outro.' });
      }
    }

    if (isDbConnected && db) {
      try {
        const updateData: any = { updatedAt: new Date() };
        
        if (data.status !== undefined) updateData.status = data.status;
        if (data.date !== undefined) updateData.date = data.date;
        if (data.timeSlot !== undefined) updateData.timeSlot = data.timeSlot;
        if (data.time_slot !== undefined) updateData.timeSlot = data.time_slot;
        
        if (data.clientPhone !== undefined) updateData.clientPhone = sanitizePhone(data.clientPhone);
        if (data.client_phone !== undefined) updateData.clientPhone = sanitizePhone(data.client_phone);
        if (data.clientName !== undefined) updateData.clientName = data.clientName;
        if (data.client_name !== undefined) updateData.clientName = data.client_name;
        if (data.professionalId !== undefined) updateData.professionalId = data.professionalId;
        if (data.professional_id !== undefined) updateData.professionalId = data.professional_id;
        if (data.professionalName !== undefined) updateData.professionalName = data.professionalName;
        if (data.professional_name !== undefined) updateData.professionalName = data.professional_name;
        if (data.services !== undefined) updateData.services = data.services;
        if (data.totalDurationMinutes !== undefined) updateData.totalDurationMinutes = data.totalDurationMinutes;
        if (data.total_duration_minutes !== undefined) updateData.totalDurationMinutes = data.total_duration_minutes;
        if (data.originalAmount !== undefined) updateData.originalAmount = data.originalAmount;
        if (data.original_amount !== undefined) updateData.originalAmount = data.original_amount;
        if (data.finalAmount !== undefined) updateData.finalAmount = data.finalAmount;
        if (data.final_amount !== undefined) updateData.finalAmount = data.final_amount;
        if (data.discountAmount !== undefined) updateData.discountAmount = data.discountAmount;
        if (data.discount_amount !== undefined) updateData.discountAmount = data.discount_amount;
        if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
        if (data.payment_method !== undefined) updateData.paymentMethod = data.payment_method;

        await db
          .update(schema.appointments)
          .set(updateData)
          .where(eq(schema.appointments.id, id));

        const updatedApt = await db.query.appointments.findFirst({ 
          where: eq(schema.appointments.id, id) 
        });

        if (data.date || data.timeSlot || data.time_slot) {
          let phone = updatedApt.clientPhone || '5511999999999';
          if (!updatedApt.clientPhone && updatedApt.clientId) {
            const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, updatedApt.clientId) });
            if (profile && profile.phone) phone = profile.phone;
          }
          const msg = `🔄 *BARBERX PREMIUM*\n\nOlá, *${updatedApt.clientName || 'Cliente'}*!\n\nSeu agendamento foi *REAGENDADO* com sucesso:\n\n📅 *Nova Data:* ${updatedApt.date}\n⏰ *Novo Horário:* ${updatedApt.timeSlot}\n✂️ *Barbeiro:* ${updatedApt.professionalName || 'Profissional BarberX'}\n\n📍 *Local:* BarberX Premium - Rua dos Barões, 1420 - Jardins\n\nTe esperamos com o café pronto! ☕`;

          sendWhatsAppMessage(phone, msg).catch(() => {});
        }

        return res.json(updatedApt);
      } catch (err: any) {
        console.warn('[API] Could not update appointment in Postgres:', err);
        return res.status(500).json({ error: 'Falha ao atualizar agendamento no banco de dados.' });
      }
    }

    res.json({ id, ...dbApt, ...data });
  } catch (e: any) {
    console.error('[API] Error updating appointment:', e);
    return handleError(res, e, req.path);
  }
});

app.get("/api/services", async (req, res) => {
  try {
    const servicesList = await db.query.services.findMany();
    // sort services by displayOrder
    servicesList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(servicesList);
  } catch (e: any) {
    console.error('Error fetching services:', e);
    return handleError(res, e, req.path);
  }
});

app.delete("/api/services/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (isDbConnected && db) {
      await db.delete(schema.services);
    }
    res.json({ success: true, message: 'Todos os serviços foram removidos.' });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.post("/api/services", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newSrv = { id: req.body.id || `srv_${Date.now()}`, ...req.body };
    await db.insert(schema.services).values(newSrv);
    res.json(newSrv);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.put("/api/services/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.update(schema.services).set({ ...req.body }).where(eq(schema.services.id, req.params.id));
    res.json({ id: req.params.id, ...req.body });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.delete("/api/services/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(schema.services).where(eq(schema.services.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

// =====================================
// Professionals API
// =====================================
app.get("/api/professionals", async (req, res) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        isAdmin = decoded.role === 'admin';
      } catch(e) {}
    }

    let professionals = await db.query.professionals.findMany();

    if (!isAdmin) {
      professionals = professionals.map((p: any) => {
        const { commissionRate, ...safeProf } = p;
        return safeProf;
      });
    }
    res.json(professionals);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.post("/api/professionals", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newProf = { id: req.body.id || `prof_${Date.now()}`, ...req.body };
    await db.insert(schema.professionals).values(newProf);
    res.json(newProf);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.put("/api/professionals/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.update(schema.professionals).set({ ...req.body }).where(eq(schema.professionals.id, req.params.id));
    res.json({ id: req.params.id, ...req.body });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.delete("/api/professionals/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(schema.professionals).where(eq(schema.professionals.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    if (e.code === '23503' || (e.message && e.message.includes('violates foreign key constraint') && e.message.includes('professionals'))) {
      return res.status(400).json({ error: 'Não é possível excluir este profissional pois ele possui agendamentos vinculados.' });
    }
    return handleError(res, e, req.path);
  }
});

// =====================================
// Products API
// =====================================

app.get("/api/availability", async (req, res) => {
  try {
    const { professionalId, date } = req.query;
    if (!professionalId || !date) {
      return res.status(400).json({ error: 'Missing professionalId or date' });
    }
    
    let appointments = [];
    appointments = await db.query.appointments.findMany({
      where: (apt: any, { and, eq, ne }: any) => and(
        eq(apt.professionalId, professionalId),
        eq(apt.date, date),
        ne(apt.status, 'cancelled')
      )
    });
    
    // Only return time slots, no PII
    res.json(appointments.map((a: any) => ({ timeSlot: a.timeSlot })));
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.get("/api/products", async (req, res) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        isAdmin = decoded.role === 'admin';
      } catch(e) {}
    }

    let products = await db.query.products.findMany();

    if (!isAdmin) {
      products = products.map((p: any) => {
        const { costPrice, commissionPercentage, ...safeProduct } = p;
        return safeProduct;
      });
    }
    res.json(products);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.post("/api/products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newProd = { id: req.body.id || `prod_${Date.now()}`, ...req.body };
    await db.insert(schema.products).values(newProd);
    res.json(newProd);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.put("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.update(schema.products).set({ ...req.body }).where(eq(schema.products.id, req.params.id));
    res.json({ id: req.params.id, ...req.body });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(schema.products).where(eq(schema.products.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

// =====================================
// Auth & Profiles API
// =====================================

function formatProfile(p: any) {
  if (!p) return null;
  const { password, ...safe } = p;
  const avatar = safe.avatarUrl || safe.avatar_url || null;
  const points = safe.loyaltyPoints ?? safe.loyalty_points ?? 0;
  const tier = safe.loyaltyTier || safe.loyalty_tier || 'Bronze';
  return {
    ...safe,
    avatarUrl: avatar,
    avatar_url: avatar,
    loyaltyPoints: points,
    loyalty_points: points,
    loyaltyTier: tier,
    loyalty_tier: tier,
  };
}

app.get("/api/auth/me", requireAuth, async (req: any, res) => {
  try {
    const user = await db.query.profiles.findFirst({
      where: eq(schema.profiles.id, req.user.id)
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(formatProfile(user));
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true });
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    if (!loginId || !password) {
      return res.status(400).json({ error: 'E-mail/telefone e senha são obrigatórios.' });
    }

    const cleanLoginId = sanitizePhone(loginId);

    const user = await db.query.profiles.findFirst({
      where: or(
        eq(schema.profiles.email, loginId.toLowerCase()),
        cleanLoginId ? eq(schema.profiles.phone, cleanLoginId) : undefined
      )
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Dados não encontrados ou credenciais inválidas.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Dados não encontrados ou credenciais inválidas.' });
    }

    const safeUser = formatProfile(user);
    
    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, phone: user.phone }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    setAuthCookie(res, token);

    res.json({
      ...safeUser,
      token: token,
    });
  } catch (e: any) {
    console.error('Error in POST /api/auth/login:', e);
    res.status(500).json({ error: 'Erro ao fazer login. Tente novamente.' });
  }
});

app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) {
      return res.status(400).json({ error: 'E-mail ou telefone é obrigatório.' });
    }
    const cleanLoginId = loginId.replace(/\D/g, '');
    const user = await db.query.profiles.findFirst({
      where: or(
        eq(schema.profiles.email, loginId.toLowerCase()),
        cleanLoginId ? eq(schema.profiles.phone, cleanLoginId) : undefined
      )
    });

    if (user && user.phone) {
      const msg = `🔑 *BARBERX PREMIUM*\n\nOlá, *${user.name}*!\n\nRecebemos uma solicitação de redefinição de senha para sua conta.\n\nUse o código de verificação: *${Math.floor(100000 + Math.random() * 900000)}*\n\nSe não foi você quem solicitou, desconsidere esta mensagem.`;
      sendWhatsAppMessage(user.phone, msg).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Instruções para redefinição de senha foram enviadas para o seu e-mail e WhatsApp cadastrado.'
    });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.get("/api/profiles", requireAuth, async (req: any, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    if (isDbConnected && db) {
      try {
        const dbProfiles = await db.query.profiles.findMany();
        let safe = dbProfiles.map((p: any) => formatProfile(p));
        if (!isAdmin) {
          safe = safe.filter((p: any) => p.id === userId);
        }
        return res.json(safe);
      } catch (err) {}
    }
    
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.post("/api/profiles", authLimiter, async (req, res) => {
  try {
    const { name, email, phone, password, role, id, avatar_url, avatarUrl, ...rest } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    
    const cleanPhone = sanitizePhone(phone);
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const dbExisting = await db.query.profiles.findFirst({
      where: or(
        cleanEmail ? eq(schema.profiles.email, cleanEmail) : undefined,
        cleanPhone ? eq(schema.profiles.phone, cleanPhone) : undefined
      )
    });
    if (dbExisting) {
      return res.status(400).json({ error: 'E-mail ou telefone já cadastrado.' });
    }

    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newId = crypto.randomUUID();
    const avatar = avatar_url || avatarUrl || rest.avatar_url || rest.avatarUrl || null;

    const dbProfile = {
      id: newId,
      name,
      email: cleanEmail,
      phone: cleanPhone || '',
      password: hashedPassword,
      role: 'client',
      avatarUrl: avatar,
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(schema.profiles).values(dbProfile);

    const safeProfile = formatProfile(dbProfile);
    
    const token = jwt.sign(
      { id: safeProfile.id, role: safeProfile.role, email: safeProfile.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    setAuthCookie(res, token);

    res.json({
      ...safeProfile,
      token: token,
    });
  } catch (e: any) {
    console.error('Error in POST /api/profiles:', e);
    return handleError(res, e, req.path);
  }
});

app.put("/api/profiles/:id", requireAuth, async (req: any, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Você só pode editar o próprio perfil' });
    }
    
    const { password, role, id, avatar_url, avatarUrl, loyaltyPoints, loyalty_points, loyaltyTier, loyalty_tier, name, email, phone, ...rest } = req.body;
    
    let setObj: any = { updatedAt: new Date() };

    if (name !== undefined) setObj.name = name;
    if (email !== undefined) setObj.email = email.toLowerCase().trim();
    if (phone !== undefined) setObj.phone = sanitizePhone(phone);

    const avatar = avatar_url !== undefined ? avatar_url : avatarUrl;
    if (avatar !== undefined) {
      setObj.avatarUrl = avatar;
    }

    if (req.user.role === 'admin') {
      const points = loyaltyPoints ?? loyalty_points;
      if (points !== undefined) setObj.loyaltyPoints = points;
      const tier = loyaltyTier ?? loyalty_tier;
      if (tier !== undefined) setObj.loyaltyTier = tier;
    }

    if (password) {
      setObj.password = await bcrypt.hash(password, 10);
    }

    await db.update(schema.profiles).set(setObj).where(eq(schema.profiles.id, req.params.id));

    const updatedProfile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.id, req.params.id)
    });

    res.json(formatProfile(updatedProfile || { id: req.params.id, ...setObj }));
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.delete("/api/profiles/:id", requireAuth, async (req: any, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Você só pode deletar o próprio perfil' });
    }
    
    await db.delete(schema.profiles).where(eq(schema.profiles.id, req.params.id));

    res.json({ success: true });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

// =====================================
// Waiting Queue API
// =====================================
app.get("/api/queue", requireAuth, async (req: any, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    let dbQueue = await db.query.waitingQueue.findMany();
    if (!isAdmin) {
      dbQueue = dbQueue.filter((q: any) => q.clientId === userId);
    }
    return res.json(dbQueue);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.post("/api/queue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newItem = { id: req.body.id || `q_${Date.now()}`, joinedAt: new Date(), ...req.body };
    await db.insert(schema.waitingQueue).values(newItem);
    res.json(newItem);
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.put("/api/queue/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.update(schema.waitingQueue).set({ ...req.body }).where(eq(schema.waitingQueue.id, req.params.id));
    res.json({ id: req.params.id, ...req.body });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

app.delete("/api/queue/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(schema.waitingQueue).where(eq(schema.waitingQueue.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

// =====================================
// Bot Chat API
// =====================================
let ai: GoogleGenAI | null = null;
app.post("/api/bot/chat", requireAuth, async (req: any, res: any) => {
  try {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
      }
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }

    const { text, history } = req.body;
    
    const services = await db.query.services.findMany();
    const professionals = await db.query.professionals.findMany();
    let queue = await db.query.waitingQueue.findMany();
    let appointments = await db.query.appointments.findMany();
    
    if (req.user.role !== 'admin') {
       queue = queue.filter((q: any) => q.clientId === req.user.id || q.clientPhone === req.user.phone);
       appointments = appointments.filter((a: any) => a.clientId === req.user.id || a.clientPhone === req.user.phone);
    }
    
    let contextText = `Você é o assistente virtual da barbearia BarberX, que atende 24/7.
Seja educado, prestativo e profissional. Responda de forma concisa.
Se um cliente perguntar sobre serviços, mostre o que temos disponível e os preços.
Se quiserem agendar, instrua o cliente a usar o botão "Agendar" na interface.
Você tem acesso aos agendamentos do cliente logado. O nome dele é ${req.user.name || req.user.email}.

Contexto da Barbearia BarberX:
Serviços:
`;
    services.forEach((s: any) => {
       contextText += `- ${s.title} (${s.durationMinutes} min): R$ ${s.price}\n`;
    });
    
    contextText += `\nProfissionais:\n`;
    professionals.forEach((p: any) => {
       contextText += `- ${p.name} (Especialidades: ${Array.isArray(p.specialties) ? p.specialties.join(', ') : 'N/A'})\n`;
    });

    contextText += `\nFila de Espera Atual:\n`;
    if (queue && queue.length > 0) {
      queue.forEach((q: any) => {
        contextText += `- Cliente: ${q.clientName}, Serviço: ${q.serviceTitle}, Profissional: ${q.professionalName || 'Qualquer'}, Status: ${q.status}\n`;
      });
    } else {
      contextText += `Fila vazia no momento.\n`;
    }

    contextText += `\nAgendamentos Ativos no Sistema:\n`;
    if (appointments && appointments.length > 0) {
      
      // Max 10 recent appointments to avoid blowing up context
      appointments.slice(0, 10).forEach((a: any) => {
        contextText += `- Dia: ${a.date} às ${a.timeSlot}, Cliente: ${a.clientName}, Status: ${a.status}\n`;
      });

    } else {
      contextText += `Nenhum agendamento.\n`;
    }

    const contents = [];
    if (history && history.length > 0) {
      history.forEach((m: any) => {
        contents.push({
          role: m.sender === 'bot' ? 'model' : 'user',
          parts: [{ text: m.text }]
        });
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: contextText,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (e: any) {
    console.error("Erro no chat:", e);
    const userMessage = (e.status === 401 || e.status === 403 || (e.message && e.message.includes('403')))
      ? 'Não foi possível autenticar com o assistente inteligente. Verifique as credenciais da API.'
      : 'Desculpe, o assistente inteligente está indisponível no momento. Tente novamente mais tarde.';
    res.status(500).json({ error: userMessage, details: e.message });
  }
});

// =====================================
// API Keys & Secrets Validation API
// =====================================
app.get("/api/admin/validate-keys", requireAuth, requireAdmin, async (req: any, res: any) => {
  const results: any[] = [];
  const startTime = Date.now();

  // 1. Validate GEMINI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    results.push({
      key: 'GEMINI_API_KEY',
      name: 'Google Gemini AI Key',
      status: 'missing',
      configured: false,
      message: 'Chave não configurada no ambiente (.env). Adicione GEMINI_API_KEY para habilitar a IA.',
    });
  } else {
    try {
      const tempAi = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const testRes = await tempAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Atenda com 'OK'",
      });
      if (testRes && testRes.text) {
        results.push({
          key: 'GEMINI_API_KEY',
          name: 'Google Gemini AI Key',
          status: 'valid',
          configured: true,
          modelTested: 'gemini-2.5-flash',
          maskedKey: `${geminiKey.substring(0, 6)}...${geminiKey.substring(geminiKey.length - 4)}`,
          message: 'Chave ativa, autenticada e respondendo com sucesso no modelo gemini-2.5-flash.',
        });
      } else {
        results.push({
          key: 'GEMINI_API_KEY',
          name: 'Google Gemini AI Key',
          status: 'invalid',
          configured: true,
          message: 'Chave respondeu sem texto válido.',
        });
      }
    } catch (err: any) {
      results.push({
        key: 'GEMINI_API_KEY',
        name: 'Google Gemini AI Key',
        status: 'invalid',
        configured: true,
        error: err.message,
        message: `Falha ao validar chave da Gemini: ${err.message || 'Erro de autenticação ou quota excedida'}`,
      });
    }
  }

  // 2. Validate DATABASE_URL / SQL_HOST
  const dbUrl = process.env.DATABASE_URL;
  const sqlHost = process.env.SQL_HOST;

  if (dbUrl || sqlHost) {
    if (isDbConnected && db && db.query) {
      try {
        await db.query.services.findFirst();
        results.push({
          key: 'DATABASE_URL / SQL_HOST',
          name: 'Banco de Dados Relacional (PostgreSQL / Drizzle)',
          status: 'valid',
          configured: true,
          type: 'PostgreSQL',
          message: 'Conexão com PostgreSQL ativa e consultas validadas no banco de dados.',
        });
      } catch (dbErr: any) {
        results.push({
          key: 'DATABASE_URL / SQL_HOST',
          name: 'Banco de Dados Relacional (PostgreSQL / Drizzle)',
          status: 'invalid',
          configured: true,
          type: 'PostgreSQL',
          message: `Erro ao realizar consulta de teste no PostgreSQL: ${dbErr.message}`,
        });
      }
    } else {
      results.push({
        key: 'DATABASE_URL',
        name: 'Banco de Dados Relacional',
        status: 'fallback',
        configured: true,
        type: 'In-Memory / FileStore',
        message: 'Variável definida porém operando em modo de contingência em memória.',
      });
    }
  } else {
    results.push({
      key: 'DATABASE_URL',
      name: 'Banco de Dados Relacional (PostgreSQL)',
      status: 'fallback',
      configured: false,
      type: 'In-Memory FileStore',
      message: 'DATABASE_URL/SQL_HOST não configurado. Aplicação rodando em armazenamento local JSON (FileStore).',
    });
  }

  // 3. Validate JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    results.push({
      key: 'JWT_SECRET',
      name: 'Chave de Assinatura de Tokens JWT',
      status: 'warning',
      configured: false,
      message: 'Usando chave secreta padrão do sistema. Recomendado definir JWT_SECRET no .env para produção.',
    });
  } else if (jwtSecret.length < 16) {
    results.push({
      key: 'JWT_SECRET',
      name: 'Chave de Assinatura de Tokens JWT',
      status: 'warning',
      configured: true,
      message: 'Chave curta (< 16 caracteres). Defina uma chave mais longa e segura para produção.',
    });
  } else {
    results.push({
      key: 'JWT_SECRET',
      name: 'Chave de Assinatura de Tokens JWT',
      status: 'valid',
      configured: true,
      message: 'Chave JWT personalizada e segura configurada com sucesso.',
    });
  }

  // 4. Validate ENCRYPTION_KEY
  const encKey = process.env.ENCRYPTION_KEY;
  results.push({
    key: 'ENCRYPTION_KEY',
    name: 'Chave de Criptografia de Dados Sensíveis',
    status: encKey ? 'valid' : 'missing',
    configured: !!encKey,
    message: encKey ? 'Chave de criptografia de dados definida.' : 'Chave não configurada. Recomendada para criptografia de dados sensíveis.',
  });

  // 5. Validate Supabase Keys
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    results.push({
      key: 'VITE_SUPABASE_URL & ANON_KEY',
      name: 'Integração Supabase',
      status: 'valid',
      configured: true,
      message: 'Configurações de URL e chave do Supabase presentes no ambiente.',
    });
  } else {
    results.push({
      key: 'VITE_SUPABASE_URL',
      name: 'Integração Supabase',
      status: 'optional',
      configured: false,
      message: 'Opcional. Não configurado no ambiente.',
    });
  }

  const durationMs = Date.now() - startTime;
  const totalConfigured = results.filter(r => r.configured).length;
  const totalValid = results.filter(r => r.status === 'valid').length;

  res.json({
    timestamp: new Date().toISOString(),
    latencyMs: durationMs,
    summary: {
      totalKeysTested: results.length,
      configuredKeys: totalConfigured,
      validKeys: totalValid,
      allValid: results.every(r => r.status === 'valid' || r.status === 'optional' || r.status === 'fallback')
    },
    keys: results
  });
});


async function seedDatabase() {
  const defaultPasswordHash = await bcrypt.hash('client123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const todayStr = new Date().toISOString().split('T')[0];

  const seedProfiles = [
    {
      id: 'usr_admin',
      name: 'BarberX Admin',
      email: 'admin@barberx.app',
      password: adminPasswordHash,
      phone: '5511999998888',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      loyaltyPoints: 1000,
      loyaltyTier: 'Diamante'
    },
    {
      id: 'usr_771902',
      name: 'Tauan Pires',
      email: 'tauan.pires@barberx.app',
      password: defaultPasswordHash,
      phone: '5511987654321',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      loyaltyPoints: 480,
      loyaltyTier: 'Ouro Metálico'
    },
    {
      id: 'usr_882191',
      name: 'Lucas Ferreira',
      email: 'lucas@example.com',
      password: defaultPasswordHash,
      phone: '5511977112233',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      loyaltyPoints: 150,
      loyaltyTier: 'Prata'
    },
    {
      id: 'usr_331092',
      name: 'Rodrigo Mendonça',
      email: 'rodrigo@example.com',
      password: defaultPasswordHash,
      phone: '5511911223344',
      role: 'client',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      loyaltyPoints: 210,
      loyaltyTier: 'Prata'
    }
  ];

  const seedProfessionals = [
    {
      id: 'prof_1',
      name: 'Carlos Silva',
      nickname: 'Carlão Navalha',
      roleTitle: 'Master Barber',
      rating: '4.90',
      reviewsCount: 142,
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
      specialties: ['Corte Clássico', 'Degradê (Fade)', 'Barba Imperial'],
      commissionRate: '0.40',
      isActive: true,
      workingHours: { monday: '09:00-19:00', tuesday: '09:00-19:00', wednesday: '09:00-19:00', thursday: '09:00-19:00', friday: '09:00-20:00', saturday: '08:00-18:00' }
    },
    {
      id: 'prof_2',
      name: 'Matheus Santos',
      nickname: 'Matheuzinho',
      roleTitle: 'Specialist Barber',
      rating: '4.80',
      reviewsCount: 98,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      specialties: ['Barba Terapia', 'Design de Sobrancelhas', 'Freestyle'],
      commissionRate: '0.35',
      isActive: true,
      workingHours: { monday: '09:00-19:00', tuesday: '09:00-19:00', wednesday: '09:00-19:00', thursday: '09:00-19:00', friday: '09:00-20:00', saturday: '08:00-18:00' }
    },
    {
      id: 'prof_3',
      name: 'Gabriel Santos',
      nickname: 'Gabi Hair',
      roleTitle: 'Stylist Barber',
      rating: '4.95',
      reviewsCount: 180,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      specialties: ['Corte Moderno', 'Pigmentação', 'Platinado'],
      commissionRate: '0.38',
      isActive: true,
      workingHours: { monday: '09:00-19:00', tuesday: '09:00-19:00', wednesday: '09:00-19:00', thursday: '09:00-19:00', friday: '09:00-20:00', saturday: '08:00-18:00' }
    },
    {
      id: 'prof_4',
      name: 'Bruno Oliveira',
      nickname: 'Brunão do Corte',
      roleTitle: 'Senior Barber',
      rating: '4.85',
      reviewsCount: 115,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      specialties: ['Corte Tesoura', 'Nevou', 'Barba Modelada'],
      commissionRate: '0.35',
      isActive: true,
      workingHours: { monday: '09:00-19:00', tuesday: '09:00-19:00', wednesday: '09:00-19:00', thursday: '09:00-19:00', friday: '09:00-20:00', saturday: '08:00-18:00' }
    },
    {
      id: 'prof_5',
      name: 'Rafael Costa',
      nickname: 'Rafa Navalhete',
      roleTitle: 'Specialist Barber',
      rating: '4.92',
      reviewsCount: 156,
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
      specialties: ['Fade Americano', 'Selagem', 'Tratamento Capilar'],
      commissionRate: '0.38',
      isActive: true,
      workingHours: { monday: '09:00-19:00', tuesday: '09:00-19:00', wednesday: '09:00-19:00', thursday: '09:00-19:00', friday: '09:00-20:00', saturday: '08:00-18:00' }
    }
  ];

  const seedServices: any[] = [
    // COMBOS (4)
    {
      id: 'srv_combo_1',
      categorySlug: 'combos',
      title: 'Combo Executivo: Corte + Barba Imperial',
      description: 'Corte de cabelo completo à sua escolha combinado com barboterapia toalha quente e massagem facial.',
      price: '95.00',
      durationMinutes: 50,
      isCombo: true,
      originalPrice: '110.00',
      discountPercentage: 14,
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_combo_2',
      categorySlug: 'combos',
      title: 'Combo Barão: Corte + Barba + Sobrancelha',
      description: 'Pacote VIP completo com lavagem especial, corte estilizado, barba completa e alinhamento de sobrancelha na navalha.',
      price: '115.00',
      durationMinutes: 60,
      isCombo: true,
      originalPrice: '135.00',
      discountPercentage: 15,
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_combo_3',
      categorySlug: 'combos',
      title: 'Combo Pai e Filho (2 Cortes)',
      description: 'Atendimento simultâneo ou em sequência para pai e filho com desconto exclusivo e bebida cortesia.',
      price: '100.00',
      durationMinutes: 60,
      isCombo: true,
      originalPrice: '120.00',
      discountPercentage: 16,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1517832606589-715006d319a2?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_combo_4',
      categorySlug: 'combos',
      title: 'Combo Dia do Noivo / Evento VIP',
      description: 'Experiência premium com corte, barba, selagem capilar, sobrancelha, bebida especial e hidratação.',
      price: '180.00',
      durationMinutes: 90,
      isCombo: true,
      originalPrice: '220.00',
      discountPercentage: 18,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400'
    },
    // CORTES (5)
    {
      id: 'srv_corte_1',
      categorySlug: 'cortes',
      title: 'Corte Moderno / Fade / Mid Fade',
      description: 'Degradê de precisão técnica (Low, Mid, High Fade) finalizado com pomada matte de alta fixação.',
      price: '60.00',
      durationMinutes: 35,
      isCombo: false,
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_corte_2',
      categorySlug: 'cortes',
      title: 'Corte Clássico Tesoura',
      description: 'Corte tradicional executado 100% na tesoura para quem busca elegância e caimento natural.',
      price: '55.00',
      durationMinutes: 40,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_corte_3',
      categorySlug: 'cortes',
      title: 'Corte Infantil (Até 12 anos)',
      description: 'Atendimento paciente e especializado para crianças com ambiente descontraído.',
      price: '50.00',
      durationMinutes: 30,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1517832606589-715006d319a2?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_corte_4',
      categorySlug: 'cortes',
      title: 'Raspar / Maquinado Simples',
      description: 'Corte rápido com máquina em tamanho único na cabeça inteira, acerto de pezinho incluso.',
      price: '35.00',
      durationMinutes: 20,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_corte_5',
      categorySlug: 'cortes',
      title: 'Pezinho / Acabamento de Contorno',
      description: 'Apenas a manutenção do contorno do pescoço e orelhas na navalha para manter o visual limpo.',
      price: '25.00',
      durationMinutes: 15,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=400'
    },
    // BARBA (3)
    {
      id: 'srv_barba_1',
      categorySlug: 'barba',
      title: 'Barboterapia Terapêutica',
      description: 'Ritual clássico com vapor de ozônio, toalha quente com essências, bálsamo hidratante e alinhamento na navalha.',
      price: '50.00',
      durationMinutes: 30,
      isCombo: false,
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_barba_2',
      categorySlug: 'barba',
      title: 'Barba Simples e Desenho',
      description: 'Desenho e aparo da barba com máquina e navalha de lâmina descartável.',
      price: '40.00',
      durationMinutes: 25,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_barba_3',
      categorySlug: 'barba',
      title: 'Modelagem de Barba com Toalha Quente',
      description: 'Abertura dos poros com toalha aquecida e loção pós-barba acalmante para pele sensível.',
      price: '45.00',
      durationMinutes: 30,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400'
    },
    // QUIMICA (3)
    {
      id: 'srv_quimica_1',
      categorySlug: 'quimica',
      title: 'Platinado / Nevou Premium',
      description: 'Descoloração global profissional com matização e reconstrução capilar inclusa.',
      price: '130.00',
      durationMinutes: 90,
      isCombo: false,
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_quimica_2',
      categorySlug: 'quimica',
      title: 'Pigmentação de Cabelo e Barba',
      description: 'Disfarce de fios brancos e falhas com tinta hipoalergênica de efeito natural.',
      price: '60.00',
      durationMinutes: 30,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'srv_quimica_3',
      categorySlug: 'quimica',
      title: 'Selagem / Alisamento Capilar',
      description: 'Redução do volume, frizz e hidratação profunda com aminoácidos e queratina.',
      price: '90.00',
      durationMinutes: 60,
      isCombo: false,
      isPopular: false,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const seedProducts = [
    {
      id: 'prod_1',
      name: 'Pomada Efeito Matte Extra Forte 100g',
      category: 'Finalizadores',
      brand: 'BarberX Pro',
      price: '45.00',
      costPrice: '18.00',
      stockQuantity: 32,
      minStockAlert: 5,
      commissionPercentage: 15,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'prod_2',
      name: 'Óleo para Barba Wood & Spice 30ml',
      category: 'Barba',
      brand: 'BarberX Care',
      price: '55.00',
      costPrice: '22.00',
      stockQuantity: 18,
      minStockAlert: 5,
      commissionPercentage: 10,
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'prod_3',
      name: 'Shampoo Mentolado Antiqueda 250ml',
      category: 'Cabelo',
      brand: 'BarberX Pro',
      price: '68.00',
      costPrice: '28.00',
      stockQuantity: 24,
      minStockAlert: 6,
      commissionPercentage: 12,
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300'
    }
  ];

  const seedAppointments = [
    {
      id: 'apt_101',
      clientId: 'usr_771902',
      clientName: 'Tauan Pires',
      clientPhone: '5511987654321',
      professionalId: 'prof_1',
      professionalName: 'Carlos Silva',
      date: todayStr,
      timeSlot: '15:00',
      status: 'in_queue',
      totalDurationMinutes: 50,
      originalAmount: '110.00',
      discountAmount: '15.00',
      finalAmount: '95.00',
      paymentMethod: 'credit_card',
      services: [{ id: 'srv_combo_1', title: 'Combo Executivo: Corte + Barba Imperial', price: 95.00 }],
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt_102',
      clientId: 'usr_882191',
      clientName: 'Lucas Ferreira',
      clientPhone: '5511977112233',
      professionalId: 'prof_2',
      professionalName: 'Matheus Santos',
      date: todayStr,
      timeSlot: '14:30',
      status: 'in_service',
      totalDurationMinutes: 35,
      originalAmount: '60.00',
      discountAmount: '0.00',
      finalAmount: '60.00',
      paymentMethod: 'pix',
      services: [{ id: 'srv_corte_1', title: 'Corte Moderno / Fade / Mid Fade', price: 60.00 }],
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt_103',
      clientId: 'usr_331092',
      clientName: 'Rodrigo Mendonça',
      clientPhone: '5511911223344',
      professionalId: 'prof_1',
      professionalName: 'Carlos Silva',
      date: todayStr,
      timeSlot: '16:00',
      status: 'confirmed',
      totalDurationMinutes: 30,
      originalAmount: '50.00',
      discountAmount: '0.00',
      finalAmount: '50.00',
      paymentMethod: 'credit_card',
      services: [{ id: 'srv_barba_1', title: 'Barboterapia Terapêutica', price: 50.00 }],
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt_104',
      clientId: 'usr_771902',
      clientName: 'Tauan Pires',
      clientPhone: '5511987654321',
      professionalId: 'prof_3',
      professionalName: 'Gabriel Santos',
      date: '2026-07-20',
      timeSlot: '11:00',
      status: 'completed',
      totalDurationMinutes: 35,
      originalAmount: '60.00',
      discountAmount: '0.00',
      finalAmount: '60.00',
      paymentMethod: 'pix',
      services: [{ id: 'srv_corte_1', title: 'Corte Moderno / Fade / Mid Fade', price: 60.00 }],
      createdAt: new Date('2026-07-20T11:00:00Z').toISOString()
    }
  ];

  const seedWaitingQueue = [
    {
      id: 'q_1',
      appointmentId: 'apt_102',
      clientId: 'usr_882191',
      clientName: 'Lucas Ferreira',
      professionalId: 'prof_2',
      serviceTitle: 'Corte Moderno Fade',
      status: 'in_chair',
      estimatedWaitMinutes: 0
    },
    {
      id: 'q_2',
      appointmentId: 'apt_101',
      clientId: 'usr_771902',
      clientName: 'Tauan Pires (Você)',
      professionalId: 'prof_1',
      serviceTitle: 'Combo Executivo: Corte + Barba',
      status: 'waiting',
      estimatedWaitMinutes: 15
    },
    {
      id: 'q_3',
      appointmentId: 'apt_103',
      clientId: 'usr_331092',
      clientName: 'Rodrigo Mendonça',
      professionalId: 'prof_1',
      serviceTitle: 'Barboterapia Terapêutica',
      status: 'waiting',
      estimatedWaitMinutes: 45
    }
  ];

  if (isDbConnected && db) {
    for (const item of seedProfiles) {
      try {
        await db.delete(schema.profiles).where(eq(schema.profiles.id, item.id));
        await db.insert(schema.profiles).values(item);
      } catch (e: any) {
        console.warn(`[Seed] Profile ${item.id} error:`, e.message);
      }
    }
    for (const item of seedProfessionals) {
      try {
        await db.delete(schema.professionals).where(eq(schema.professionals.id, item.id));
        await db.insert(schema.professionals).values(item);
      } catch (e: any) {
        console.warn(`[Seed] Professional ${item.id} error:`, e.message);
      }
    }
    for (const item of seedServices) {
      try {
        await db.delete(schema.services).where(eq(schema.services.id, item.id));
        await db.insert(schema.services).values(item);
      } catch (e: any) {
        console.warn(`[Seed] Service ${item.id} error:`, e.message);
      }
    }
    for (const item of seedProducts) {
      try {
        await db.delete(schema.products).where(eq(schema.products.id, item.id));
        await db.insert(schema.products).values(item);
      } catch (e: any) {
        console.warn(`[Seed] Product ${item.id} error:`, e.message);
      }
    }
    for (const item of seedAppointments) {
      try {
        await db.delete(schema.appointments).where(eq(schema.appointments.id, item.id));
        const dbApt = {
          id: item.id,
          clientId: item.clientId,
          clientName: item.clientName,
          clientPhone: item.clientPhone,
          professionalId: item.professionalId,
          professionalName: item.professionalName,
          date: item.date,
          timeSlot: item.timeSlot,
          status: item.status,
          totalDurationMinutes: item.totalDurationMinutes,
          originalAmount: item.originalAmount,
          discountAmount: item.discountAmount,
          finalAmount: item.finalAmount,
          paymentMethod: item.paymentMethod,
          services: item.services,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date()
        };
        await db.insert(schema.appointments).values(dbApt);
      } catch (e: any) {
        console.warn(`[Seed] Appointment ${item.id} error:`, e.message);
      }
    }
    for (const item of seedWaitingQueue) {
      try {
        await db.delete(schema.waitingQueue).where(eq(schema.waitingQueue.id, item.id));
        await db.insert(schema.waitingQueue).values(item);
      } catch (e: any) {
        console.warn(`[Seed] WaitingQueue ${item.id} error:`, e.message);
      }
    }
  }



  return {
    profiles: seedProfiles.length,
    professionals: seedProfessionals.length,
    services: seedServices.length,
    products: seedProducts.length,
    appointments: seedAppointments.length,
    queue: seedWaitingQueue.length
  };
}

app.post("/api/seed", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const result = await seedDatabase();
    res.json({ success: true, seeded: result });
  } catch (e: any) {
    return handleError(res, e, 'POST /api/seed');
  }
});

app.get("/api/system/status", requireAuth, requireAdmin, (req, res) => {
  res.json({
    databaseConnected: isDbConnected,
    databaseType: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// =====================================
// Cron Service for Reminders
// =====================================
app.post("/api/cron/reminders", async (req: any, res: any) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Autorizado via secret header
  } else {
    // Verifica se o usuário é admin autenticado
    let token = req.cookies.token;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded?.role !== 'admin') {
          return res.status(403).json({ error: 'Acesso negado: Requer privilégios de administrador ou CRON_SECRET.' });
        }
      } catch {
        return res.status(401).json({ error: 'Não autorizado' });
      }
    } else {
      return res.status(401).json({ error: 'Não autorizado. Forneça o header de autorização com CRON_SECRET ou token de administrador.' });
    }
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = await db.query.appointments.findMany({
      where: eq(schema.appointments.date, todayStr)
    });
    let sentCount = 0;
    for (const apt of upcoming) {
      if (apt.clientPhone) {
        await sendWhatsAppMessage(apt.clientPhone, `Lembrete Barbearia: Você possui um agendamento hoje às ${apt.timeSlot}.`);
        sentCount++;
      }
    }
    return res.json({ success: true, processed: upcoming.length, sentCount });
  } catch (e: any) {
    return handleError(res, e, req.path);
  }
});

export default app;
