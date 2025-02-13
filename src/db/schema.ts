import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: uuid().primaryKey().defaultRandom(),
  clerkId: text().unique().notNull(),
  name: text().notNull(),
  // adsads
  imageUrl: text().notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow(),
},(t)=>[uniqueIndex('clerk_id_idx').on(t.clerkId)]);