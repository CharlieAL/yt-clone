'use client'
import { z } from 'zod'
import { trpc } from '~/trpc/client'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Button } from '~/components/ui/button'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
  FormLabel,
  FormItem
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'

import {
  CheckIcon,
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparkleIcon,
  Trash2Icon
} from 'lucide-react'
import { videoUpdateSchema } from '~/db/schema'
import { toast } from 'sonner'
import { VideoPlayer } from '~/modules/videos/ui/components/video-player'
import Link from 'next/link'
import { snakeCaseTitle } from '~/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { APP_URL, THUMBNAIL_FALLBACK } from '~/constants'
import { ThumbnailUploaderModal } from '../components/thumnail-uploader-modal'

interface VideoFormSectionProps {
  videoId: string
}

export const VideoFormSection = ({ videoId }: VideoFormSectionProps) => {
  return (
    <Suspense fallback={<p>loading...</p>}>
      <ErrorBoundary fallback={<p>error</p>}>
        <VideoFormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideoFormSectionSuspense = ({ videoId }: VideoFormSectionProps) => {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false)

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })
  const [categories] = trpc.categories.getMany.useSuspenseQuery()
  const update = trpc.videos.upload.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success('Video updated')
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success('Video thumbnail restored')
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  const remove = trpc.videos.remove.useMutation({
    onSuccess: ({ title }) => {
      utils.studio.getMany.invalidate()
      toast.success(`Video "${title}" removed`)
      router.replace('/studio')
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: ({ title }) => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success(`Video "${title}" revalidated`)
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video
  })

  const onSubmit = (values: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(values)
  }

  // TODO: change if deployed outside of VERCEL
  const fullUrl = `${APP_URL}/videos/${videoId}`

  const [isCopied, setIsCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <>
      <ThumbnailUploaderModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='font-bold text-2xl'>Video details</h1>
              <p className='text-xs text-muted-foreground'>
                Manage your video details
              </p>
            </div>
            <div className='flex items-center gap-x-2'>
              <Button type='submit' disabled={update.isPending}>
                {update.isPending && <Loader className='animate-spin' />}
                {update.isSuccess && <CheckIcon />}
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'ghost'} size={'icon'}>
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => {
                      remove.mutate({ id: video.id })
                    }}
                  >
                    <Trash2Icon className='size-4' />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      revalidate.mutate({ id: video.id })
                    }}
                  >
                    <RotateCcwIcon className='size-4' />
                    Revalidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 mb-24'>
            <div className='space-y-8 lg:col-span-3'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title
                      {/* TODO: add ai generete button */}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Add title to your video' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      {/* TODO: add ai generete button */}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        rows={10}
                        className='resize-none h-60'
                        placeholder='Add description to your video'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* TODO: Add thumbnail field here  */}
              <FormField
                name='thumbnailUrl'
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className='p-0.5 boder border-dashed border-neutral-400 relative h-[84px] w-[153px] group'>
                        <Image
                          src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                          fill
                          className='object-cover'
                          alt='Thumbnail'
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size={'icon'}
                              type='button'
                              className='bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100'
                            >
                              <MoreVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='start' side='right'>
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className='size-4 mr-1' />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <SparkleIcon className='size-4 mr-1' />
                              AI-generete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCcwIcon className='size-4 mr-1' />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category
                      {/* TODO: add ai generete button */}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-y-8 lg:col-span-2'>
              <div className='flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit'>
                <div className='aspect-video overflow-hidden relative'>
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className='p-4 flex flex-col gap-6'>
                  <div className='flex justify-between items-center gap-x-2'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>
                        Video Link
                      </p>
                      <div className='flex items-center gap-x-2'>
                        <Link href={`/videos/${video.id}`}>
                          <p className='line-clamp-1 text-sm text-blue-500'>
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type='button'
                          variant={'ghost'}
                          size={'icon'}
                          className='shrink-0'
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>
                        Video status
                      </p>
                      <p className='text-sm'>
                        {snakeCaseTitle(video.muxStatus || 'preparing')}
                      </p>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>
                        Subtitles status
                      </p>
                      <p className='text-sm'>
                        {snakeCaseTitle(video.muxTrackStatus || 'no_subtitles')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name='visibility'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Visibility
                      {/* TODO: add ai generete button */}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a ' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'public'}>
                          <Globe2Icon />
                          Public
                        </SelectItem>
                        <SelectItem value={'private'}>
                          <LockIcon />
                          Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
