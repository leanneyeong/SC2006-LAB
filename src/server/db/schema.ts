import { users } from "@clerk/clerk-sdk-node";
import { InferInsertModel, sql } from "drizzle-orm";
import {
  char,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userSchema = pgTable(
  "user",
  {
    id:text("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email:text("email").unique().notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  }
);

// Carpark Info Table
export const carparkInfoSchema = pgTable(
  "carparkInfo", 
  {
    CarParkID: text("CarParkID").primaryKey(),
    Development: text("Development").notNull(),
    Area: text("Area").notNull(),
    Agency: text("Agency").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
  }
);

// Availability Lot Table
export const availabilityLotSchema = pgTable(
  "availabilityLot", 
  {
    id: serial("id").primaryKey(),
    CarParkID: text("CarParkID").notNull()
    .references(() => carparkInfoSchema.CarParkID),
    AvailableLots: integer("AvailableLots").notNull(),
    LotType: char("LotType").notNull(),
  }
);

export const favouritesSchema = pgTable(
  "favourites",
  {
    id: serial("id").primaryKey(),
    userID: text("userID").notNull().references(() => userSchema.id),
    CarParkID: text("CarParkID").notNull()
    .references(() => carparkInfoSchema.CarParkID),
  }
)