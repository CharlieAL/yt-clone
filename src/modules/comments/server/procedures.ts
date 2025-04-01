import { TRPCError } from '@trpc/server'
import { and, count, desc, eq, getTableColumns, lt, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { comments, users } from '~/db/schema'
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure
} from '~/trpc/init'

export const commentsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      const { id: userId } = ctx.user

      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning()

      if (!deletedComment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' })
      }
      return deletedComment
    }),
  create: protectedProcedure
    .input(z.object({ videoId: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const { videoId, content } = input
      const [comment] = await db
        .insert(comments)
        .values({
          videoId,
          userId,
          content
        })
        .returning()

      return comment
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string(),
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

      const [totalData, data] = await Promise.all([
        db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.videoId, videoId)),
        db
          .select({
            ...getTableColumns(comments),
            user: {
              name: users.name,
              imageUrl: users.imageUrl,
              clerkId: users.clerkId
            }
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId),
              cursor
                ? or(
                    lt(comments.updatedAt, cursor.updatedAt),
                    and(
                      eq(comments.updatedAt, cursor.updatedAt),
                      lt(comments.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .innerJoin(users, eq(comments.userId, users.id))
          .orderBy(desc(comments.updatedAt), desc(comments.id))
          .limit(limit + 1)
      ])

      // add 1 becaue we need to know if there is more data

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

      return { data: items, nextCursor, totalCount: totalData[0].count }
    })
})
