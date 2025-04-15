import { cn } from '~/lib/utils'
import { UserGetOneOutputs } from '../../types'
import { useAuth } from '@clerk/nextjs'
import { Button } from '~/components/ui/button'
import { Edit2Icon } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'
import { BannerUploadModal } from './banner-upload-modal'
import { useState } from 'react'

interface UserBannerProps {
  user: UserGetOneOutputs
}

export const UserBanner = ({ user }: UserBannerProps) => {
  // este es id de clerk
  const { userId } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <div className='relative group'>
      <BannerUploadModal
        open={open}
        onOpenChange={() => setOpen(!open)}
        userId={user.id}
      />
      <div
        className={cn(
          'w-full max-h-[200px] h-[15vh] md:h-[25vh] bg-gradient-to-r from-gray-100 to-gray-100 rounded-xl ',
          user.bannerUrl && 'bg-center bg-cover'
        )}
        style={{
          backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined
        }}
      >
        {user.clerkId === userId && (
          <Button
            type='button'
            size='icon'
            className='absolute top-4 right-4 bg-black/50 hover:bg-black/50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full'
            onClick={() => setOpen(!open)}
          >
            <Edit2Icon className='size-4 text-white' />
          </Button>
        )}
      </div>
    </div>
  )
}

export const UserBannerSkeleton = () => {
  return (
    <Skeleton className='w-full max-h-[200px] h-[15vh] md:h-[25vh] rounded-xl' />
  )
}
