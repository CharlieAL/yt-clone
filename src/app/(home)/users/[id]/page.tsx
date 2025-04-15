import { DEFAULT_LIMIT } from '~/constants'
import { UserView } from '~/modules/users/ui/views/user-view'
import { HydrateClient, trpc } from '~/trpc/server'

interface UserPageProps {
  params: Promise<{ id: string }>
}

const UserPage = async ({ params }: UserPageProps) => {
  const { id } = await params

  void trpc.users.getOne.prefetch({ id })
  void trpc.videos.getMany.prefetchInfinite({
    creatorId: id,
    limit: DEFAULT_LIMIT
  })

  return (
    <HydrateClient>
      <UserView userId={id} />
    </HydrateClient>
  )
}

export default UserPage
