import { useEffect } from 'react'
import { useIntersectionObserver } from '~/hooks/use-intersection-observer'
import { Button } from './ui/button'

interface InfiniteScrollProps {
  isManual?: boolean
  hasNextPage: boolean
  isFetchinNextPage: boolean
  fetchNextPage: () => void
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchinNextPage,
  fetchNextPage
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '100px'
  })

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchinNextPage && !isManual) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchinNextPage, fetchNextPage, isManual])
  return (
    <div className='flex flex-col gap-4 p-4 items-center'>
      <div ref={targetRef} className='h-1' />
      {hasNextPage ? (
        <Button
          variant={'secondary'}
          disabled={!hasNextPage || isFetchinNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchinNextPage ? 'Loading...' : 'Load More'}
        </Button>
      ) : (
        <p className='text-xs text-muted-foreground'>
          You have reached the end of the list
        </p>
      )}
    </div>
  )
}
