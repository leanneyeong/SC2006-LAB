import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";

const carParkSchema = pgTable(
  "car_park",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    carParkNo: text('car_park_no').notNull(),
    address: text('address'),
    xCoord: text('x_coord'),
    yCoord: text('y_coord'),
    carParkType: text('car_park_type'),
    typeOfParkingSystem: text('type_of_parking_system'),
    shortTermParking: text('short_term_parking'),
    freeParking: text('free_parking'),
    nightParking: text('night_parking'),
    carParkDecks: text('car_park_decks'),
    gantryHeight: text('gantry_height'),
    carParkBasement: text('car_park_basement'),
    createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
  }
)

export default carParkSchema