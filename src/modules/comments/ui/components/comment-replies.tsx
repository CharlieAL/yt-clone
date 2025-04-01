import { DEFAULT_LIMIT_COMMENTS } from '~/constants'
import { trpc } from '~/trpc/client'
import { CommentItem } from './comment-item'
import { CornerDownRightIcon, Loader2Icon } from 'lucide-react'
import { Button } from '~/components/ui/button'

interface CommentRepliesProps {
  videoId: string
  parentId: string
}

export const CommentReplies = ({ videoId, parentId }: CommentRepliesProps) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.comments.getMany.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT_COMMENTS,
        videoId,
        parentId
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )

  return (
    <div className='pl-14'>
      <div className='flex flex-col gap-4 mt-2'>
        {isLoading && (
          <div className='flex justify-center items-center'>
            <Loader2Icon className='animate-spin size-6 text-muted-foreground' />
          </div>
        )}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.data)
            .map((reply) => (
              <CommentItem key={reply.id} comment={reply} variant='reply' />
            ))}
      </div>
      {hasNextPage && !isFetchingNextPage && (
        <Button
          variant={'tertiary'}
          size={'sm'}
          className='h-8'
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <CornerDownRightIcon className='size-4' />
          Show more replies
        </Button>
      )}
      {isFetchingNextPage && (
        <div className='flex justify-center items-center'>
          <Loader2Icon className='animate-spin size-6 text-muted-foreground' />
        </div>
      )}
    </div>
  )
}
