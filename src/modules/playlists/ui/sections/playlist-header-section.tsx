'use client'
import { trpc } from '~/trpc/client'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2Icon } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'

interface PlaylistHeaderSectionProps {
  playlistId: string
}

export const PlaylistHeaderSection = ({
  playlistId
}: PlaylistHeaderSectionProps) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error ..</p>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex flex-col gap-y-2'>
        <Skeleton className='h-6 w-28' />
        <Skeleton className='h-4 w-56' />
      </div>
      <Skeleton className='size-8 rounded-full' />
    </div>
  )
}

const PlaylistHeaderSectionSuspense = ({
  playlistId
}: PlaylistHeaderSectionProps) => {
  const utils = trpc.useUtils()
  const router = useRouter()

  const [playlist] = trpc.playlist.getOne.useSuspenseQuery({ playlistId })

  const remove = trpc.playlist.remove.useMutation({
    onSuccess: ({ name }) => {
      toast.success(`Playlist ${name} deleted`)
      utils.playlist.getMany.invalidate()

      router.push('/playlists')
    },
    onError: (error) => {
      console.log(error)
      toast.error('Something went wrong')
    }
  })
  return (
    <div className='flex justify-between items-center'>
      <div>
        <h1 className='text-2xl font-bold'>{playlist.name}</h1>
        <p className='text-xs text-muted-foreground'>
          {playlist.description || 'Videos you have added to this playlist.'}
        </p>
      </div>
      <Button
        variant={'outline'}
        size={'icon'}
        className='rounded-full'
        onClick={() => remove.mutate({ playlistId })}
        disabled={remove.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  )
}
