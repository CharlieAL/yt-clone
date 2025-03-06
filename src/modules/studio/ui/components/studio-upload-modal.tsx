'use client'
import { Loader, Loader2Icon, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ResponsiveModal } from '~/components/responsive-modal'
import { Button } from '~/components/ui/button'
import { trpc } from '~/trpc/client'
import { StudioUploader } from './studio-uploader'

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
      <ResponsiveModal
        open={!!create.data?.url}
        title='Upload a Video'
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={() => {}} />
        ) : (
          <Loader2Icon />
        )}
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
