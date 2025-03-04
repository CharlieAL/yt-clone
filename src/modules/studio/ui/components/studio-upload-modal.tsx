'use client'
import { Loader, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ResponsiveModal } from '~/components/responsive-modal'
import { Button } from '~/components/ui/button'
import { trpc } from '~/trpc/client'

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      toast.success('Created video')
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })
  return (
    <>
      <ResponsiveModal open title='Upload a Video' onOpenChange={() => {}}>
        <p>this will be an uploader</p>
      </ResponsiveModal>
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
    </>
  )
}
