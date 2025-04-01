'use client'
import { Loader2Icon } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { InfiniteScroll } from '~/components/infinite-scroll'
import { DEFAULT_LIMIT_COMMENTS } from '~/constants'
import { CommentForm } from '~/modules/comments/ui/components/comment-form'
import { CommentItem } from '~/modules/comments/ui/components/comment-item'
import { trpc } from '~/trpc/client'

interface CommentsSectionProps {
  videoId: string
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<CommnetsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error ...</p>}>
        <SuspenseCommentsSection videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const CommnetsSectionSkeleton = () => {
  return (
    <div className='mt-6 flex justify-center items-center'>
      <Loader2Icon className='animate-spin size-7 text-gray-300' />
    </div>
  )
}

const SuspenseCommentsSection = ({ videoId }: CommentsSectionProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT_COMMENTS
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )
  return (
    <div className='mt-6'>
      <div className={'flex flex-col gap-6'}>
        <h1 className='text-lg font-semibold'>
          {comments.pages[0].totalCount} Comments
        </h1>
        <CommentForm videoId={videoId} />
      </div>
      <div className='flex flex-col gap-4 mt-2'>
        {comments.pages
          .flatMap((page) => page.data)
          .map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        <InfiniteScroll
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>
    </div>
  )
}
