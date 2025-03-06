import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus
} from '@mux/mux-uploader-react'
import { UploadIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'

interface StudioUploaderProps {
  endpoint?: string
  onSuccess: () => void
}
const UPLOADER_ID = 'id-uploader-videos'
export const StudioUploader = ({
  endpoint,
  onSuccess
}: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader
        onSuccess={onSuccess}
        endpoint={endpoint}
        id={UPLOADER_ID}
        className='hidden group/uploader:'
      />
      <MuxUploaderDrop className='group/drop' muxUploader={UPLOADER_ID}>
        <div slot='heading' className='flex flex-col items-center gap-6'>
          <div className='flex justify-center items-center gap-2 rounded-full size-32 bg-muted'>
            <UploadIcon className='size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-200' />
          </div>
          <div className='flex flex-col gap-2 text-center'>
            <p className='text-sm'>Drag and drop video files to upload</p>
            <p className='text-xs text-muted-foreground'>
              Your videos will be privete until you publish them.
            </p>
          </div>
          <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
            <Button type='button' className='rounded-full'>
              Select files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot='separator' className='hidden' />

        <MuxUploaderStatus muxUploader={UPLOADER_ID} className='text-sm pt-5' />
        <MuxUploaderProgress
          muxUploader={UPLOADER_ID}
          className='text-sm'
          type='percentage'
        />
        <MuxUploaderProgress
          muxUploader={UPLOADER_ID}
          type='bar'
          className='pb-5'
        />
      </MuxUploaderDrop>
    </div>
  )
}
