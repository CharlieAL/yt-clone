import { z } from 'zod'
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm'
import { db } from '~/db'

import {
  comments,
  users,
  videos,
  videosReactions,
  videosViews
} from '~/db/schema'
import { createTRPCRouter, protectedProcedure } from '~/trpc/init'
import { TRPCError } from '@trpc/server'

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const { id } = input
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)))

      if (!video) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return video
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
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const { id: userId } = ctx.user

      const data = await db
        .select({
          ...getTableColumns(videos),
          author: users,
          views: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          comments: db.$count(comments, eq(comments.videoId, videos.id)),
          likes: db.$count(
            videosReactions,
            and(
              eq(videosReactions.videoId, videos.id),
              eq(videosReactions.type, 'like')
            )
          )
        })
        .from(videos)
        .innerJoin(users, eq(users.id, videos.userId))
        .where(
          and(
            eq(videos.userId, userId),
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
    })
})
