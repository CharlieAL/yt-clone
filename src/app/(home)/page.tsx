import { HydrateClient, trpc } from '~/trpc/server'
import { PageClient } from './client'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export default async function HomePage() {
  void trpc.hello.prefetch({ text: ', YT clone 😈 from the server' })
  return (
    <HydrateClient>
      <Suspense fallback='Loading...'>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <PageClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  )
}
