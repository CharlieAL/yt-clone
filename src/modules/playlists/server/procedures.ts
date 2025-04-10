import { TRPCError } from '@trpc/server'
import { and, desc, eq, getTableColumns, lt, or, sql } from 'drizzle-orm'

import { z } from 'zod'
import { db } from '~/db'
import {
  playlists,
  playlistVideos,
  users,
  videos,
  videosReactions,
  videosViews
} from '~/db/schema'

import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const playlistRouter = createTRPCRouter({
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input
      const { id: userId } = ctx.user

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))

      if (!existingPlaylist) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))

      if (!existingVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
      if (!existingPlaylistVideo) {
        throw new TRPCError({
          code: 'NOT_FOUND'
        })
      }

      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning()
      if (!deletedPlaylistVideo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se pudo eliminar el video a la playlist'
        })
      }
      return deletedPlaylistVideo
    }),
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input
      const { id: userId } = ctx.user

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))

      if (!existingPlaylist) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))

      if (!existingVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
      if (existingPlaylistVideo) {
        throw new TRPCError({
          code: 'CONFLICT'
        })
      }

      const [createdPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId
        })
        .returning()
      if (!createdPlaylistVideo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se pudo agregar el video a la playlist'
        })
      }
      return createdPlaylistVideo
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
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
      const { id: userId } = ctx.user
      const { cursor, limit, videoId } = input

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videosCount: db
            .$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id))
            .as('videos'),
          author: users,
          containsVideo: videoId
            ? sql<boolean>`(
              SELECT EXISTS (
                SELECT 1
                FROM ${playlistVideos} pv
                WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId}
              )
            )`
            : sql<boolean>`false`
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )

        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
  getMany: protectedProcedure
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
      const { id: userId } = ctx.user
      const { cursor, limit } = input

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videosCount: db
            .$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id))
            .as('videos'),
          author: users,
          thumbnailUrl: sql<string | null>`(
            SELECT v.thumbnail_url FROM ${playlistVideos} pv
            JOIN ${videos} v ON v.id = pv.video_id
            WHERE pv.playlist_id = ${playlists.id}
            ORDER BY pv.updated_at DESC
            LIMIT 1
          )`
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )

        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().nullish()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { name, description } = input
      const [createdPlaylist] = await db
        .insert(playlists)
        .values({
          name,
          description,
          userId
        })
        .returning()

      if (!createdPlaylist) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No se pudo crear la playlist'
        })
      }

      return createdPlaylist
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date()
          })
          .nullish(),
        limit: z.number().min(1).max(100)
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { cursor, limit } = input

      const viewerVideoReaction = db.$with('viewer_video_reaction').as(
        db
          .select({
            videoId: videosReactions.videoId,
            likedAt: videosReactions.updatedAt
          })
          .from(videosReactions)
          .where(
            and(
              eq(videosReactions.userId, userId),
              eq(videosReactions.type, 'like')
            )
          )
      )

      const data = await db
        .with(viewerVideoReaction)
        .select({
          ...getTableColumns(videos),
          author: users,
          likedAt: viewerVideoReaction.likedAt,
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
          viewerVideoReaction,
          eq(videos.id, viewerVideoReaction.videoId)
        )
        .where(
          and(
            eq(videos.visibility, 'public'),
            cursor
              ? or(
                  lt(viewerVideoReaction.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReaction.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoReaction.likedAt), desc(videos.id))
        .limit(limit + 1) // add 1 becaue we need to know if there is more data

      const hasMore = data.length > limit
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            likedAt: lastItem.likedAt
          }
        : null

      return { data: items, nextCursor }
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date()
          })
          .nullish(),
        limit: z.number().min(1).max(100)
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user
      const { cursor, limit } = input

      const viewerVideoViews = db.$with('viewer_video_views').as(
        db
          .select({
            videoId: videosViews.videoId,
            viewedAt: videosViews.updatedAt
          })
          .from(videosViews)
          .where(eq(videosViews.userId, userId))
      )

      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videos),
          author: users,
          viewedAt: viewerVideoViews.viewedAt,
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
        .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
        .where(
          and(
            eq(videos.visibility, 'public'),
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )

        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
        .limit(limit + 1) // add 1 becaue we need to know if there is more data

      const hasMore = data.length > limit
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewedAt: lastItem.viewedAt
          }
        : null

      return { data: items, nextCursor }
    })
})
