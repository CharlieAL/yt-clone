import { PlaylistGetManyOutput } from '../../types'
import { Skeleton } from '~/components/ui/skeleton'

interface PlaylistInfoProps {
  data: PlaylistGetManyOutput['data'][number]
}

export const PlaylistInfoSkeleton = () => {
  return (
    <div className='flex gap-3'>
      <div className='min-w-0 flex-1 space-y-2'>
        <Skeleton className='h-4 w-3/4 ' />
        <Skeleton className='h-4 w-1/2 ' />
        <Skeleton className='h-4 w-1/3' />
      </div>
    </div>
  )
}

export const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
  return (
    <div className='flex gap-3'>
      <div className='min-w-0 flex-1'>
        <h3 className='font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words'>
          {data.name}
        </h3>
        <p className='text-sm text-muted-foreground line-clamp-2'>
          {data.description || 'Playlist'}
        </p>
        <p className='text-sm text-muted-foreground font-semibold hover:text-primary'>
          view full playlist
        </p>
      </div>
    </div>
  )
}
