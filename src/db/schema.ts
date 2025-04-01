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
  uuid,
  primaryKey
} from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const users = pgTable(
  'user',
  {
    id: uuid().primaryKey().defaultRandom(),
    clerkId: text().unique().notNull(),
    name: text().notNull(),
    imageUrl: text().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (t) => [uniqueIndex('clerk_id_idx').on(t.clerkId)]
)

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videosViews: many(videosViews),
  videosReactions: many(videosReactions),
  suscriptions: many(subscriptions, {
    relationName: 'subscriptions_viewer_id_fkey'
  }),
  suscribers: many(subscriptions, {
    relationName: 'subscriptions_creator_id_fkey'
  }),
  comments: many(comments),
  commentReaction: many(commentReactions)
}))

export const subscriptions = pgTable(
  'subscriptions',
  {
    viewerId: uuid('viewer_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    creatorId: uuid('creator_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (t) => [
    primaryKey({
      name: 'subscriptions_pk',
      columns: [t.viewerId, t.creatorId]
    })
  ]
)

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName: 'subscriptions_viewer_id_fkey'
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: 'subscriptions_creator_id_fkey'
  })
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
  thumbnailKey: text('thumbnail_key'),
  previewUrl: text('preview_url'),
  previewKey: text('preview_key'),
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

export const videosReletions = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id]
  }),
  views: many(videosViews),
  reactions: many(videosReactions),
  comments: many(comments)
}))

export const videoSelectSchema = createSelectSchema(videos)
export const videoCreateSchema = createInsertSchema(videos)
export const videoUpdateSchema = createUpdateSchema(videos)

export const comments = pgTable('comments', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  videoId: uuid('video_id')
    .references(() => videos.id, { onDelete: 'cascade' })
    .notNull(),
  content: text().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id]
  }),
  reactions: many(commentReactions)
}))

export const commentSelectSchema = createSelectSchema(comments)
export const commentInsertSchema = createInsertSchema(comments, {
  content: z.string().min(1, { message: 'Porfavor ingrese algo' }).max(280)
})
export const commentUpdateSchema = createUpdateSchema(comments)

export const reactionType = pgEnum('reaction_type', ['like', 'dislike'])

export const commentReactions = pgTable(
  'comment_reactions',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    commentId: uuid('comment_id')
      .references(() => comments.id, { onDelete: 'cascade' })
      .notNull(),
    type: reactionType('reaction').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (t) => [
    primaryKey({
      name: 'comment_reaction_pk',
      columns: [t.userId, t.commentId]
    })
  ]
)
export const commentReactionRelations = relations(
  commentReactions,
  ({ one }) => ({
    user: one(users, {
      fields: [commentReactions.userId],
      references: [users.id]
    }),
    comment: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id]
    })
  })
)

export const videosViews = pgTable(
  'video_views',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    videoId: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (t) => [
    primaryKey({
      name: 'video_view_pk',
      columns: [t.userId, t.videoId]
    })
  ]
)

export const videosViewsRelations = relations(videosViews, ({ one }) => ({
  user: one(users, {
    fields: [videosViews.userId],
    references: [users.id]
  }),
  video: one(videos, {
    fields: [videosViews.videoId],
    references: [videos.id]
  })
}))

export const videoViewSelectSchema = createSelectSchema(videosViews)
export const videoViewCreateSchema = createInsertSchema(videosViews)
export const videoViewUpdateSchema = createUpdateSchema(videosViews)

export const videosReactions = pgTable(
  'video_reactions',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    videoId: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    type: reactionType('reaction').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (t) => [
    primaryKey({
      name: 'video_reaction_pk',
      columns: [t.userId, t.videoId]
    })
  ]
)

export const videosReactionRelations = relations(
  videosReactions,
  ({ one }) => ({
    user: one(users, {
      fields: [videosReactions.userId],
      references: [users.id]
    }),
    video: one(videos, {
      fields: [videosReactions.videoId],
      references: [videos.id]
    })
  })
)

export const videoReactionsSelectSchema = createSelectSchema(videosReactions)
export const videoReactionsCreateSchema = createInsertSchema(videosReactions)
export const videoReactionsUpdateSchema = createUpdateSchema(videosReactions)
