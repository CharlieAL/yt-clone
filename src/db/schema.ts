import { relations } from 'drizzle-orm'

import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core'

export const users = pgTable(
  'user',
  {
    id: uuid().primaryKey().defaultRandom(),
    clerkId: text().unique().notNull(),
    name: text().notNull(),
    // adsads
    imageUrl: text().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (t) => [uniqueIndex('clerk_id_idx').on(t.clerkId)]
)

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos)
}))

export const categories = pgTable(
  'categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (t) => [uniqueIndex('name_idx').on(t.name)]
)

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos)
}))

export const videos = pgTable('videos', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text(),
  userId: uuid('user_id')
    .references(() => users.id, {
      onDelete: 'cascade'
    })
    .notNull(),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null'
  }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const videosReletions = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id]
  })
}))
