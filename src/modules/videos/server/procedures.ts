import { TRPCError } from '@trpc/server'
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or
} from 'drizzle-orm'
import { UTApi } from 'uploadthing/server'
import { z } from 'zod'
import { db } from '~/db'
import {
  subscriptions,
  users,
  videos,
  videosReactions,
  videoUpdateSchema,
  videosViews
} from '~/db/schema'
import { mux } from '~/lib/mux'
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure
} from '~/trpc/init'

export const videosRouter = createTRPCRouter({
  getManySubscribed: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date()
          })
          .nullish(),
        limit: z.number().min(1).max(100)
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input
      const { id: userId } = ctx.user

      const subscriptionsSubQuery = db.$with('subscriptions').as(
        db
          .select({
            creatorId: subscriptions.creatorId
          })
          .from(subscriptions)
          .where(eq(subscriptions.viewerId, userId))
      )

      const data = await db
        .with(subscriptionsSubQuery)
        .select({
          ...getTableColumns(videos),
          author: users,
          views: db
            .$count(videosViews, eq(videosViews.videoId, videos.id))
            .as('videoViews'),
          likes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'like')
            )
          ),
          dislikes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'dislike')
            )
          )
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          subscriptionsSubQuery,
          eq(subscriptionsSubQuery.creatorId, users.id)
        )
        .where(
          and(
            eq(videos.visibility, 'public'),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1) // add 1 becaue we need to know if there is more data

      const hasMore = data.length > limit
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt
          }
        : null

      return { data: items, nextCursor }
    }),
  getTrending: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewCount: z.number()
          })
          .nullish(),
        limit: z.number().min(1).max(100)
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input

      const viewCountSubQuery = db
        .$count(videosViews, eq(videosViews.videoId, videos.id))
        .as('videoViews')

      const data = await db
        .select({
          ...getTableColumns(videos),
          author: users,
          views: viewCountSubQuery,
          likes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'like')
            )
          ),
          dislikes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'dislike')
            )
          )
        })
        .from(videos)
        .where(
          and(
            eq(videos.visibility, 'public'),
            cursor
              ? or(
                  lt(viewCountSubQuery, cursor.viewCount),
                  and(
                    eq(viewCountSubQuery, cursor.viewCount),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .orderBy(desc(viewCountSubQuery), desc(videos.id))
        .limit(limit + 1) // add 1 becaue we need to know if there is more data

      const hasMore = data.length > limit
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewCount: lastItem.views
          }
        : null

      return { data: items, nextCursor }
    }),
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date()
          })
          .nullish(),
        limit: z.number().min(1).max(100)
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, categoryId } = input

      const data = await db
        .select({
          ...getTableColumns(videos),
          author: users,
          views: db
            .$count(videosViews, eq(videosViews.videoId, videos.id))
            .as('videoViews'),
          likes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'like')
            )
          ),
          dislikes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'dislike')
            )
          )
        })
        .from(videos)
        .where(
          and(
            eq(videos.visibility, 'public'),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(videos.userId, users.id))
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1) // add 1 becaue we need to know if there is more data

      const hasMore = data.length > limit
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt
          }
        : null

      return { data: items, nextCursor }
    }),
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx

      let userId

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

      if (user) {
        userId = user.id
      }

      const viewerReactions = db.$with('viewer_ractions').as(
        db
          .select({
            videoId: videosReactions.videoId,
            type: videosReactions.type
          })
          .from(videosReactions)
          .where(inArray(videosReactions.userId, userId ? [userId] : []))
      )

      const viewerSubscriptions = db.$with('viewer_subscriptions').as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      )

      const [existingVideo] = await db
        .with(viewerReactions, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
            subscribedCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),
            viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            )
          },
          views: db
            .$count(videosViews, eq(videosViews.videoId, videos.id))
            .as('videoViews'),
          likes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'like')
            )
          ),
          dislikes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'dislike')
            )
          ),
          viewerReaction: viewerReactions.type
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        )
        .where(eq(videos.id, input.id))
        .limit(1)
      // .groupBy(videos.id, users.id, viewerReactions.type)
      if (!existingVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return existingVideo
    }),
  revalidate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
      if (!existingVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      if (!existingVideo.muxUploadId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const upload = await mux.video.uploads.retrieve(existingVideo.muxUploadId)

      if (!upload || !upload.asset_id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const asset = await mux.video.assets.retrieve(upload.asset_id)

      if (!asset) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const playbackId = asset.playback_ids?.[0]?.id
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0
      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxAssetId: asset.id,
          muxPlaybackId: playbackId,
          duration
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()
      if (!updatedVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return updatedVideo
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))

      if (!existingVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const utapi = new UTApi()

      if (existingVideo.thumbnailKey) {
        await utapi.deleteFiles(existingVideo.thumbnailKey)
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(
            and(eq(videos.id, existingVideo.id), eq(videos.userId, userId))
          )
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl)

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()
      if (!updatedVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return updatedVideo
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const [removedVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()
      if (!removedVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return removedVideo
    }),
  upload: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      if (!input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date()
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()

      if (!updatedVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return updatedVideo
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user

    const upload = await mux.video.uploads.create({
      cors_origin: '*', //TODO: in production, set this to your domain
      new_asset_settings: {
        playback_policy: ['public']
      }
    })

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: 'Untitled',
        muxUploadId: upload.id,
        muxStatus: upload.status
      })
      .returning()

    return {
      video,
      url: upload.url
    }
  })
})
