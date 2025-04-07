import { pgTable, text, uuid, geometry, integer, pgEnum, timestamp, decimal, jsonb, varchar, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Define our own constants instead of importing
const CURRENT_TIMESTAMP = sql`CURRENT_TIMESTAMP`;

// Define vehicle categories inline instead of importing
const vehicleCategory = [
  'car',
  'motorcycle',
  'heavy_vehicle',
  'bicycle',
  'electric_vehicle'
] as const;
type VehicleCategory = typeof vehicleCategory[number];

// Define parking systems inline instead of importing
const parkingSystem = [
  'electronic',
  'coupon',
  'app_based',
  'manual',
  'free'
] as const;
type ParkingSystem = typeof parkingSystem[number];

// Enums
export const vehicleCategoryEnum = pgEnum('lot_type_enum', vehicleCategory);
export const parkingSystemEnum = pgEnum('parking_system_enum', parkingSystem);

// New enum for pricing types
export const pricingTypeEnum = pgEnum('pricing_type_enum', [
  'flat_rate',
  'hourly',
  'per_entry',
  'progressive',
  'time_blocks',
  'day_night',
  'free'
]);

// New enum for agency
export const agencyEnum = pgEnum('agency_enum', [
  'HDB',
  'URA',
  'LTA',
  'PRIVATE'
]);

// Main car park table
export const carParkSchema = pgTable(
  "car_park",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    address: text('address'),
    vehicleCategory: vehicleCategoryEnum('vehicle_category').notNull(),
    parkingSystem: parkingSystemEnum('parking_system').notNull(),
    capacity: integer('capacity').notNull(),
    availableLots: integer("available_lots").notNull(),
    location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
    agency: agencyEnum('agency').notNull(),
    externalId: text('external_id').notNull(), // Original ID from the source API
    isActive: boolean('is_active').default(true).notNull(),
    area: text('area'),
    development: text('development'),
    locationDescription: text('location_description'),
    coordinates: text('coordinates'), // For URA-specific coordinate format
    metadata: jsonb('metadata'), // For additional unstructured data from APIs
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
);

// Car park pricing table
export const carParkPricingSchema = pgTable(
  "car_park_pricing",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    carParkId: uuid('car_park_id').notNull().references(() => carParkSchema.id, { onDelete: 'cascade' }),
    vehicleCategory: vehicleCategoryEnum('vehicle_category').notNull(),
    pricingType: pricingTypeEnum('pricing_type').notNull(),
    weekdayRate: decimal('weekday_rate', { precision: 10, scale: 2 }),
    weekendRate: decimal('weekend_rate', { precision: 10, scale: 2 }),
    publicHolidayRate: decimal('public_holiday_rate', { precision: 10, scale: 2 }),
    maximumDailyRate: decimal('maximum_daily_rate', { precision: 10, scale: 2 }),
    minimumCharge: decimal('minimum_charge', { precision: 10, scale: 2 }),
    graceTime: integer('grace_time_minutes'), // Grace period in minutes
    description: text('description'), // For any special pricing notes
    startTime: varchar('start_time', { length: 5 }), // Format: "HH:MM"
    endTime: varchar('end_time', { length: 5 }), // Format: "HH:MM"
    metadata: jsonb('metadata'), // For complex pricing structures
    isDefault: boolean('is_default').default(false).notNull(), // For identifying the main pricing scheme
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
);

// Time-based pricing blocks for progressive pricing
export const pricingBlockSchema = pgTable(
  "pricing_block",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pricingId: uuid('pricing_id').notNull().references(() => carParkPricingSchema.id, { onDelete: 'cascade' }),
    blockOrder: integer('block_order').notNull(), // For ordering blocks in progressive pricing
    durationMinutes: integer('duration_minutes').notNull(),
    rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
);

// Car park operating hours
export const operatingHoursSchema = pgTable(
  "operating_hours",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    carParkId: uuid('car_park_id').notNull().references(() => carParkSchema.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0-6, 0 = Sunday
    openTime: varchar('open_time', { length: 5 }), // Format: "HH:MM"
    closeTime: varchar('close_time', { length: 5 }), // Format: "HH:MM"
    is24Hours: boolean('is_24_hours').default(false).notNull(),
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
);

// Historical availability data (for analytics)
export const availabilityHistorySchema = pgTable(
  "availability_history",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    carParkId: uuid('car_park_id').notNull().references(() => carParkSchema.id),
    availableLots: integer('available_lots').notNull(),
    timestamp: timestamp('timestamp').notNull(),
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
);

// Relations
export const carParkRelations = relations(carParkSchema, ({ many }) => ({
  pricing: many(carParkPricingSchema),
  operatingHours: many(operatingHoursSchema),
  availabilityHistory: many(availabilityHistorySchema)
}));

export const carParkPricingRelations = relations(carParkPricingSchema, ({ one, many }) => ({
  carPark: one(carParkSchema, {
    fields: [carParkPricingSchema.carParkId],
    references: [carParkSchema.id]
  }),
  pricingBlocks: many(pricingBlockSchema)
}));

export const pricingBlockRelations = relations(pricingBlockSchema, ({ one }) => ({
  pricing: one(carParkPricingSchema, {
    fields: [pricingBlockSchema.pricingId],
    references: [carParkPricingSchema.id]
  })
}));

export const operatingHoursRelations = relations(operatingHoursSchema, ({ one }) => ({
  carPark: one(carParkSchema, {
    fields: [operatingHoursSchema.carParkId],
    references: [carParkSchema.id]
  })
}));

export const availabilityHistoryRelations = relations(availabilityHistorySchema, ({ one }) => ({
  carPark: one(carParkSchema, {
    fields: [availabilityHistorySchema.carParkId],
    references: [carParkSchema.id]
  })
}));

export default {
  carParkSchema,
  carParkPricingSchema,
  pricingBlockSchema,
  operatingHoursSchema,
  availabilityHistorySchema
};