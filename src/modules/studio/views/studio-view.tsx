import { VideosSection } from '../ui/sections/videos-section'

export const StudioView = () => {
  return (
    <div className='flex flex-col gap-y-6 pt-2.5'>
      <div className='px-4'>
        <h1 className='text-2xl font-bold'>Channel content</h1>
        <p className='text-xs text-muted-foreground'>
          All the videos and content you have uploaded to your channel
        </p>
      </div>
      <VideosSection />
    </div>
  )
}
