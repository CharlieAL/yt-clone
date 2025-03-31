import MuxPlayer from '@mux/mux-player-react'
import { THUMBNAIL_FALLBACK } from '~/constants'

interface VideoPlayerProps {
  playbackId?: string | null | undefined
  thumbnailUrl?: string | null | undefined
  autoPlay?: boolean
  onPlay?: () => void
}

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay
}: VideoPlayerProps) => {
  if (!playbackId) {
    return null
  }
  return (
    <MuxPlayer
      playbackId={playbackId || THUMBNAIL_FALLBACK}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className='size-full object-contain'
      accentColor='#FF2056'
      onPlay={onPlay}
    />
  )
}

export const VideoPlayerSkeleton = () => {
  return (
    <div className='relative w-full aspect-video bg-black animate-pulse rounded-xl' />
  )
}
