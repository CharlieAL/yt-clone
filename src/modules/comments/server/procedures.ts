import { TRPCError } from '@trpc/server'
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or
} from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { commentReactions, comments, users } from '~/db/schema'
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
    .input(
      z.object({
        videoId: z.string(),
        content: z.string(),
        parentId: z.string().uuid().nullish()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const { videoId, content, parentId } = input

      console.log(parentId)

      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []))

      if (!existingComment && parentId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot reply to a reply'
        })
      }

      const [comment] = await db
        .insert(comments)
        .values({
          videoId,
          userId,
          content,
          parentId
        })
        .returning()

      return comment
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string(),
        parentId: z.string().uuid().nullish(),
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
      const { videoId, cursor, limit, parentId } = input
      const { clerkUserId } = ctx

      let userId

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

      if (user) {
        userId = user.id
      }

      const viewer_ractions = db.$with('viewer_ractions').as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      )

      const replies = db.$with('replies').as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as('count')
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      )

      const [totalData, data] = await Promise.all([
        db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.videoId, videoId)),
        db
          .with(viewer_ractions, replies)
          .select({
            ...getTableColumns(comments),
            user: users,
            viewerReaction: viewer_ractions.type,
            replyCount: replies.count,
            likes: db.$count(
              commentReactions,
              and(
                eq(commentReactions.commentId, comments.id),
                eq(commentReactions.type, 'like')
              )
            ),
            dislikes: db.$count(
              commentReactions,
              and(
                eq(commentReactions.commentId, comments.id),
                eq(commentReactions.type, 'dislike')
              )
            )
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId),
              parentId
                ? eq(comments.parentId, parentId)
                : isNull(comments.parentId),
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
          .leftJoin(viewer_ractions, eq(viewer_ractions.commentId, comments.id))
          .leftJoin(replies, eq(replies.parentId, comments.id))
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
