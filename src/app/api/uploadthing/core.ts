import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError, UTApi } from 'uploadthing/server'
import { z } from 'zod'
import { db } from '~/db'
import { users, videos } from '~/db/schema'

const f = createUploadthing()

export const ourFileRouter = {
  bannerUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1
    }
  })
    .middleware(async () => {
      // This code runs on your server before upload
      const { userId: clerkUserId } = await auth()

      // If you throw, the user will not be able to upload
      if (!clerkUserId) throw new UploadThingError('Unauthorized')

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
      if (!existingUser) throw new UploadThingError('Unauthorized')

      if (!existingUser) throw new UploadThingError('Not found')
      if (existingUser.bannerKey) {
        const utapi = new UTApi()

        await utapi.deleteFiles(existingUser.bannerKey)
        await db
          .update(users)
          .set({
            bannerKey: null,
            bannerUrl: null
          })
          .where(and(eq(users.id, existingUser.id)))
      }
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {
        userId: existingUser.id
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(users)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key
        })
        .where(eq(users.id, metadata.userId))

      console.log('Upload complete for userId:', metadata.userId)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId
      }
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1
    }
  })
    .input(
      z.object({
        videoId: z.string().uuid()
      })
    )
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const { userId: clerkUserId } = await auth()

      // If you throw, the user will not be able to upload
      if (!clerkUserId) throw new UploadThingError('Unauthorized')

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
      if (!user) throw new UploadThingError('Unauthorized')

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey
        })
        .from(videos)
        .where(and(eq(videos.userId, user.id), eq(videos.id, input.videoId)))
      if (!existingVideo) throw new UploadThingError('Not found')
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi()

        await utapi.deleteFiles(existingVideo.thumbnailKey)
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null
          })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)))
      }
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {
        user,
        ...input
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const userId = metadata.user.id
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key
        })
        .where(and(eq(videos.id, metadata.videoId), eq(videos.userId, userId)))

      console.log('Upload complete for userId:', userId)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: userId
      }
    })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
