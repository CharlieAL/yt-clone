'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { DEFAULT_LIMIT_SUGGESTIONS } from '~/constants'
import { trpc } from '~/trpc/client'
import { VideoRowCard } from '../components/video-row-card'
import { VideoGridCard } from '../components/video-grid-card'
import { InfiniteScroll } from '~/components/infinite-scroll'

interface SuggestionsSectionProps {
  videoId: string
  isManual?: boolean
}

export const SuggestionsSection = ({
  videoId,
  isManual
}: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <ErrorBoundary fallback={<p>Error ...</p>}>
        <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  )
}

const SuggestionsSectionSuspense = ({
  videoId,
  isManual
}: SuggestionsSectionProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT_SUGGESTIONS
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )
  return (
    <>
      <div className='hidden md:block space-y-3'>
        {suggestions.pages
          .flatMap((page) => page.data)
          .map((suggestion) => (
            <VideoRowCard
              key={suggestion.id}
              data={suggestion}
              size={'compact'}
            />
          ))}
      </div>
      <div className='block md:hidden space-y-10'>
        {suggestions.pages
          .flatMap((page) => page.data)
          .map((suggestion) => (
            <VideoGridCard key={suggestion.id} data={suggestion} />
          ))}
      </div>
      <InfiniteScroll
        isManual={isManual}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  )
}
