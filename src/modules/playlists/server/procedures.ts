import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm'

import { z } from 'zod'
import { db } from '~/db'
import { users, videos, videosReactions, videosViews } from '~/db/schema'

import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const playlistRouter = createTRPCRouter({
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
        .innerJoin(
          viewerVideoViews,

          eq(videos.id, viewerVideoViews.videoId)
        )
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
