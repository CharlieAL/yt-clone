import { TRPCError } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { videos, videosUpdateSchema } from '~/db/schema'
import { mux } from '~/lib/mux'
import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const videosRouter = createTRPCRouter({
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
    .input(videosUpdateSchema)
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
