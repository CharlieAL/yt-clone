import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { videosViews } from '~/db/schema'
import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const videoViewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input
      const { id: userId } = ctx.user

      const [existingVideoView] = await db
        .select()
        .from(videosViews)
        .where(
          and(eq(videosViews.userId, userId), eq(videosViews.videoId, videoId))
        )

      if (existingVideoView) {
        return existingVideoView
      }

      const [createdVideoView] = await db
        .insert(videosViews)
        .values({ userId, videoId })
        .returning()

      return createdVideoView
    })
})
