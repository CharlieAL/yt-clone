import { eq } from 'drizzle-orm'
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent
} from '@mux/mux-node/resources/webhooks'
import { headers } from 'next/headers'
import { mux } from '~/lib/mux'
import { db } from '~/db'
import { videos } from '~/db/schema'
import { UTApi } from 'uploadthing/server'

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET

type WebHookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent

export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) {
    throw new Error('Missing MUX_WEBHOOK_SECRET')
  }

  const headersPayload = await headers()
  const muxSignature = headersPayload.get('mux-signature')

  if (!muxSignature) {
    return new Response('No signature found', { status: 401 })
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  mux.webhooks.verifySignature(
    body,
    {
      'mux-signature': muxSignature
    },
    SIGNING_SECRET
  )

  switch (payload.type as WebHookEvent['type']) {
    case 'video.asset.created': {
      const data = payload.data as VideoAssetCreatedWebhookEvent['data']

      if (!data.upload_id) {
        return new Response('No upload ID found', { status: 400 })
      }

      console.log('Create video', { UploadId: data.upload_id })

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }
    case 'video.asset.ready': {
      const data = payload.data as VideoAssetReadyWebhookEvent['data']
      const playbackId = data.playback_ids?.[0]?.id
      if (!data.upload_id) {
        return new Response('No upload ID found', { status: 400 })
      }
      if (!playbackId) {
        return new Response('No playback ID found', { status: 400 })
      }

      const duration = data.duration ? Math.round(data.duration * 1000) : 0

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`

      const utapi = new UTApi()

      const [uploadedThumbnail, uploadedPreview] =
        await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl])

      if (!uploadedThumbnail.data || !uploadedPreview.data) {
        return new Response('Failed to upload thumbnail or preview', {
          status: 500
        })
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data
      const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data

      await db
        .update(videos)
        .set({
          muxPlaybackId: playbackId,
          muxStatus: data.status,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          previewKey,
          duration
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }
    case 'video.asset.errored': {
      const data = payload.data as VideoAssetErroredWebhookEvent['data']
      if (!data.upload_id) {
        return new Response('No upload ID found', { status: 400 })
      }
      await db
        .update(videos)
        .set({
          muxStatus: data.status
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }
    case 'video.asset.deleted': {
      const data = payload.data as VideoAssetDeletedWebhookEvent['data']
      if (!data.upload_id) {
        return new Response('No asset ID found', { status: 400 })
      }

      console.log('Deleting video', { UploadId: data.upload_id })
      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id))
      break
    }
  }
  return new Response('Webhook recivied', { status: 200 })
}
