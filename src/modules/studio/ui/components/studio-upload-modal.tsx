'use client'
import { Loader, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { trpc } from '~/trpc/client'

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      toast.success('Created video')
    },
    onError: () => {
      toast.error('Failed to create video')
    }
  })
  return (
    <Button
      variant='secondary'
      onClick={() => create.mutate()}
      disabled={create.isPending}
    >
      {create.isPending ? (
        <Loader className='animate-spin' />
      ) : (
        <PlusIcon className='size-4' />
      )}
      <span>Create</span>
    </Button>
  )
}
