import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";
import carParkSchema from "./carparks-schema";

const userSchema = pgTable(
    "user",
    {
      id:text("id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email:text("email").notNull(),
      isDarkMode: boolean("is_dark_mode").notNull().default(false),
      createdAt:timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      deletedAt:timestamp("deleted_at").default(CURRENT_TIMESTAMP)
      .notNull(),
    }
);

export default userSchema