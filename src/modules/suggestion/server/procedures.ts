import { z } from 'zod'
import { and, desc, eq, getTableColumns, lt, not, or } from 'drizzle-orm'
import { db } from '~/db'

import { users, videos, videosReactions, videosViews } from '~/db/schema'
import { baseProcedure, createTRPCRouter } from '~/trpc/init'
import { TRPCError } from '@trpc/server'

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
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
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId))

      if (!existingVideo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Video not found'
        })
      }

      const data = await db
        .select({
          ...getTableColumns(videos),
          author: users,
          viewsCount: db.$count(
            videosViews,
            eq(videosViews.videoId, videos.id)
          ),
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
        .innerJoin(users, eq(users.id, videos.userId))
        .where(
          and(
            not(eq(videos.id, existingVideo.id)),
            eq(videos.visibility, 'public'),
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : undefined,
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
