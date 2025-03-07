import { relations } from 'drizzle-orm'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import {
  integer,
  pgEnum,
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

export const videoVisibility = pgEnum('video_visibility', ['public', 'private'])

export const videos = pgTable('videos', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text(),
  muxStatus: text('mux_status'),
  muxAssetId: text('mux_asset_id').unique(),
  muxUploadId: text('mux_upload_id').unique(),
  muxPlaybackId: text('mux_playback_id').unique(),
  muxTrackId: text('mux_track_id').unique(),
  muxTrackStatus: text('mux_track_status'),
  thumbnailUrl: text('thumbnail_url'),
  previewUrl: text('preview_url'),
  duration: integer('duration').default(0).notNull(),
  visibility: videoVisibility('visibility').default('private').notNull(),
  userId: uuid('user_id')
    .references(() => users.id, {
      onDelete: 'cascade'
    })
    .notNull(),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null'
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export const videosSelectSchema = createSelectSchema(videos)
export const videosCreateSchema = createInsertSchema(videos)
export const videosUpdateSchema = createUpdateSchema(videos)
