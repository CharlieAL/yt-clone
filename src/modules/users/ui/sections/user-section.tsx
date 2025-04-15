'use client'

import { trpc } from '~/trpc/client'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { UserBanner, UserBannerSkeleton } from '../components/user-banner'
import { UserPageInfo, UserPageInfoSkeleton } from '../components/user-page-info'
import { Separator } from '~/components/ui/separator'

interface UserSectionProps {
  userId: string
}

export const UserSection = ({ userId }: UserSectionProps) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error.</p>}>
        <UserSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const UserSectionSkeleton = () => {
  return (
    <div className='flex flex-col'>
      <UserBannerSkeleton />
      <UserPageInfoSkeleton />
      <Separator />
    </div>
  )
}

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId })
  return (
    <div className='flex flex-col'>
      <UserBanner user={user} />
      <UserPageInfo user={user} />
      <Separator />
    </div>
  )
}
