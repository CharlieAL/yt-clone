import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { videosReactions } from '~/db/schema'
import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input
      const { id: userId } = ctx.user

      const [existingVideoReactionLike] = await db
        .select()
        .from(videosReactions)
        .where(
          and(
            eq(videosReactions.userId, userId),
            eq(videosReactions.videoId, videoId),
            eq(videosReactions.type, 'like')
          )
        )

      if (existingVideoReactionLike) {
        const [deletedVideoReaction] = await db
          .delete(videosReactions)
          .where(
            and(
              eq(videosReactions.userId, userId),
              eq(videosReactions.videoId, videoId)
            )
          )
          .returning()
        return deletedVideoReaction
      }

      const [createdVideoReaction] = await db
        .insert(videosReactions)
        .values({ userId, videoId, type: 'like' })
        .onConflictDoUpdate({
          target: [videosReactions.userId, videosReactions.videoId],
          set: { type: 'like' }
        })
        .returning()

      return createdVideoReaction
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input
      const { id: userId } = ctx.user

      const [existingVideoReactionDislike] = await db
        .select()
        .from(videosReactions)
        .where(
          and(
            eq(videosReactions.userId, userId),
            eq(videosReactions.videoId, videoId),
            eq(videosReactions.type, 'dislike')
          )
        )

      if (existingVideoReactionDislike) {
        const [deletedVideoReaction] = await db
          .delete(videosReactions)
          .where(
            and(
              eq(videosReactions.userId, userId),
              eq(videosReactions.videoId, videoId)
            )
          )
          .returning()
        return deletedVideoReaction
      }

      const [createdVideoReaction] = await db
        .insert(videosReactions)
        .values({ userId, videoId, type: 'dislike' })
        .onConflictDoUpdate({
          target: [videosReactions.userId, videosReactions.videoId],
          set: { type: 'dislike' }
        })
        .returning()

      return createdVideoReaction
    })
})
