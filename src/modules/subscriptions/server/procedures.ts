import { TRPCError } from '@trpc/server'
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { subscriptions, users } from '~/db/schema'
import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const subscriptionsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.string().uuid(),
            updatedAt: z.date()
          })
          .nullish(),
        limit: z.number().min(1).max(100)
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input
      const { id: userId } = ctx.user

      console.log(userId)

      const data = await db
        .select({
          ...getTableColumns(subscriptions),
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            )
          }
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id))
        .where(
          and(
            eq(subscriptions.viewerId, userId),
            cursor
              ? or(
                  lt(subscriptions.updatedAt, cursor.updatedAt),
                  and(
                    eq(subscriptions.updatedAt, cursor.updatedAt),
                    lt(subscriptions.creatorId, cursor.creatorId)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
        .limit(limit + 1) // add 1 becaue we need to know if there is more data

      const hasMore = data.length > limit
      // remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data
      // set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            creatorId: lastItem.creatorId,
            updatedAt: lastItem.updatedAt
          }
        : null

      return { data: items, nextCursor }
    }),
  create: protectedProcedure
    .input(z.object({ creatorId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { creatorId } = input
      const { id: viewerId } = ctx.user

      if (creatorId === viewerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot subscribe to yourself'
        })
      }

      const [createdSubscription] = await db
        .insert(subscriptions)
        .values({
          creatorId,
          viewerId
        })
        .returning()

      return createdSubscription
    }),
  remove: protectedProcedure
    .input(z.object({ creatorId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { creatorId } = input
      const { id: viewerId } = ctx.user

      if (creatorId === viewerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot unsubscribe from yourself'
        })
      }

      const [deletedSubscription] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.creatorId, creatorId),
            eq(subscriptions.viewerId, viewerId)
          )
        )
        .returning()

      return deletedSubscription
    })
})
