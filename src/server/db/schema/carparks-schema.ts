import { pgTable, text, uuid, timestamp, geometry, integer } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";

const carParkSchema = pgTable(
  "car_park",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    carParkNo: text('car_park_no').notNull(),
    address: text('address').notNull(),
    location: geometry('location').notNull(),
    carParkType: text('car_park_type').notNull(),
    typeOfParkingSystem: text('type_of_parking_system').notNull(),
    shortTermParking: text('short_term_parking').notNull(),
    freeParking: text('free_parking').notNull(),
    nightParking: text('night_parking').notNull(),
    carParkDecks: text('car_park_decks').notNull(),
    gantryHeight: text('gantry_height').notNull(),
    carParkBasement: text('car_park_basement').notNull(),
    availableLots: integer('available_lots').notNull(),
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
)

export default carParkSchema