'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { DEFAULT_LIMIT } from '~/constants'
import { trpc } from '~/trpc/client'

import {
  VideoRowCard,
  VideoRowCardSkeleton
} from '~/modules/videos/ui/components/video-row-card'
import {
  VideoGridCard,
  VideoGridCardSkeleton
} from '~/modules/videos/ui/components/video-grid-card'
import { useIsMobile } from '~/hooks/use-mobile'
import { InfiniteScroll } from '~/components/infinite-scroll'

interface ResultsSectionProps {
  query: string | undefined
  categoryId: string | undefined
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  return (
    <Suspense
      key={`${query}-${categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p>Error ..</p>}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const ResultsSectionSkeleton = () => {
  return (
    <>
      <div className='md:flex flex-col gap-4 hidden'>
        {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
          <VideoRowCardSkeleton key={i} />
        ))}
      </div>
      <div className='flex flex-col gap-4 p-4 gap-y-10 pt-6 md:hidden'>
        {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
          <VideoGridCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}

const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {
  const [results, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  const isMobile = useIsMobile()

  return (
    <>
      {isMobile ? (
        <div className='flex flex-col gap-4 gap-y-10'>
          {results.pages
            .flatMap((page) => page.data)
            .map((video) => (
              <VideoGridCard key={video.id} data={video} />
            ))}
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {results.pages
            .flatMap((page) => page.data)
            .map((video) => (
              <VideoRowCard key={video.id} data={video} size={'default'} />
            ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  )
}
