'use client'

import Link from 'next/link'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { InfiniteScroll } from '~/components/infinite-scroll'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'

import { DEFAULT_LIMIT } from '~/constants'
import { trpc } from '~/trpc/client'

export const VideosSection = () => {
  return (
    <Suspense fallback={<p>loading</p>}>
      <ErrorBoundary fallback={<p>error</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )
  return (
    <div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='pl-6 w-[510px]'>Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Views</TableHead>
              <TableHead className='text-right'>Comments</TableHead>
              <TableHead className='text-right pr-6'>Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages
              .flatMap((page) => page.data)
              .map((video) => (
                <Link
                  key={video.id}
                  href={`/studio/videos/${video.id}`}
                  legacyBehavior
                >
                  <TableRow className='cursor-pointer'>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchinNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}
