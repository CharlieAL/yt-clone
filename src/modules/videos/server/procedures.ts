import { db } from '~/db'
import { videos } from '~/db/schema'
import { mux } from '~/lib/mux'
import { createTRPCRouter, protectedProcedure } from '~/trpc/init'

export const videosRouter = createTRPCRouter({
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
