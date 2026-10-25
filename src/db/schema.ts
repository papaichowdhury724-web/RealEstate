import { pgTable, text, jsonb, timestamp, customType } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

// Local fallback tables mirroring Firestore collections.
export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  bytes: bytea("bytes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
