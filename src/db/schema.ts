import { pgTable, text, timestamp, boolean, integer, numeric, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  phone: text('phone'),
  role: text('role').notNull().default('client'),
  avatarUrl: text('avatar_url'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  loyaltyTier: text('loyalty_tier').notNull().default('Bronze'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const professionals = pgTable('professionals', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  nickname: text('nickname'),
  roleTitle: text('role_title').notNull().default('Master Barber'),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  reviewsCount: integer('reviews_count').notNull().default(0),
  photoUrl: text('photo_url'),
  specialties: jsonb('specialties').default([]),
  commissionRate: numeric('commission_rate', { precision: 4, scale: 2 }).notNull().default('0.40'),
  isActive: boolean('is_active').notNull().default(true),
  workingHours: jsonb('working_hours').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: text('id').primaryKey(),
  categorySlug: text('category_slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  isCombo: boolean('is_combo').notNull().default(false),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  discountPercentage: integer('discount_percentage').default(0),
  isPopular: boolean('is_popular').notNull().default(false),
  imageUrl: text('image_url'),
  galleryUrls: jsonb('gallery_urls').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone'),
  professionalId: text('professional_id').notNull().references(() => professionals.id, { onDelete: 'restrict' }),
  professionalName: text('professional_name').notNull(),
  date: text('appointment_date').notNull(),
  timeSlot: text('time_slot').notNull(),
  status: text('status').notNull().default('confirmed'),
  totalDurationMinutes: integer('total_duration_minutes').notNull(),
  originalAmount: numeric('original_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  finalAmount: numeric('final_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(),
  bookingCode: text('booking_code').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  services: jsonb('services').notNull().default([]),
  cancellationReason: text('cancellation_reason'),
  isReviewed: boolean('is_reviewed').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    bookingConflictIdx: uniqueIndex('booking_conflict_idx')
      .on(table.professionalId, table.date, table.timeSlot)
      .where(sql`status != 'cancelled'`),
  };
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minStockAlert: integer('min_stock_alert').notNull().default(5),
  commissionPercentage: integer('commission_percentage').default(0),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const waitingQueue = pgTable('waiting_queue', {
  id: text('id').primaryKey(),
  appointmentId: text('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  clientName: text('client_name').notNull(),
  professionalId: text('professional_id').references(() => professionals.id, { onDelete: 'set null' }),
  serviceTitle: text('service_title').notNull(),
  status: text('status').notNull().default('waiting'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  estimatedWaitMinutes: integer('estimated_wait_minutes').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  appointmentId: text('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  professionalId: text('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scheduleBlocks = pgTable('schedule_blocks', {
  id: text('id').primaryKey(),
  professionalId: text('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cashTransactions = pgTable('cash_transactions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  paymentMethod: text('payment_method').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull().default('completed'),
  professionalName: text('professional_name'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relationships
export const scheduleBlocksRelations = relations(scheduleBlocks, ({ one }) => ({
  professional: one(professionals, {
    fields: [scheduleBlocks.professionalId],
    references: [professionals.id],
  }),
}));
export const profilesRelations = relations(profiles, ({ many }) => ({
  appointments: many(appointments),
}));

export const professionalsRelations = relations(professionals, ({ many, one }) => ({
  userProfile: one(profiles, {
    fields: [professionals.userId],
    references: [profiles.id],
  }),
  appointments: many(appointments),
  waitingQueue: many(waitingQueue),
  reviews: many(reviews),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  clientProfile: one(profiles, {
    fields: [appointments.clientId],
    references: [profiles.id],
  }),
  professional: one(professionals, {
    fields: [appointments.professionalId],
    references: [professionals.id],
  }),
  review: one(reviews, {
    fields: [appointments.id],
    references: [reviews.appointmentId],
  }),
}));


export const reviewsRelations = relations(reviews, ({ one }) => ({
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
  professional: one(professionals, {
    fields: [reviews.professionalId],
    references: [professionals.id],
  }),
}));

export const waitingQueueRelations = relations(waitingQueue, ({ one }) => ({
  appointment: one(appointments, {
    fields: [waitingQueue.appointmentId],
    references: [appointments.id],
  }),
  professional: one(professionals, {
    fields: [waitingQueue.professionalId],
    references: [professionals.id],
  }),
  clientProfile: one(profiles, {
    fields: [waitingQueue.clientId],
    references: [profiles.id],
  }),
}));
