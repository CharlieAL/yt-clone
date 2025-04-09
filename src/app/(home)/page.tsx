export const dynamic = 'force-dynamic'

import { HydrateClient, trpc } from '~/trpc/server'
import { HomeView } from '~/modules/home/ui/views/home'
import { DEFAULT_LIMIT } from '~/constants'

interface HomePageProps {
  searchParams: Promise<{
    categoryId?: string
  }>
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const { categoryId } = await searchParams
  void trpc.categories.getMany.prefetch()
  void trpc.videos.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    categoryId: categoryId
  })
  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  )
}

export default HomePage
