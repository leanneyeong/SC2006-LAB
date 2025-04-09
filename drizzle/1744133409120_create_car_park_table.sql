
CREATE TABLE IF NOT EXISTS "car_park" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "car_park_no" text NOT NULL,
  "address" text,
  "x_coord" text,
  "y_coord" text,
  "car_park_type" text,
  "type_of_parking_system" text,
  "short_term_parking" text,
  "free_parking" text,
  "night_parking" text,
  "car_park_decks" text,
  "gantry_height" text,
  "car_park_basement" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
