import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ResponsiveModal } from '~/components/responsive-modal'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { playlistCreateSchema } from '~/db/schema'
import { trpc } from '~/trpc/client'

interface PlaylistCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const PlaylistCreateModal = ({
  open,
  onOpenChange
}: PlaylistCreateModalProps) => {
  const utils = trpc.useUtils()

  const createPlaylistSchema = playlistCreateSchema.omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
    id: true
  })

  const form = useForm<z.infer<typeof createPlaylistSchema>>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })
  const create = trpc.playlist.create.useMutation({
    onSuccess: ({ name }) => {
      onOpenChange(false)
      form.reset()
      toast.success(`Playlist ${name} created`)
      utils.playlist.getMany.invalidate()
    },
    onError: (error) => {
      console.log('error', error)
      toast.error('Something went wrong')
    }
  })

  const handleSubmit = (values: z.infer<typeof createPlaylistSchema>) => {
    console.log('values', values)
    create.mutate(values)
  }
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title='Create Playlist'
    >
      <Form {...form}>
        <form
          className='space-y-4 px-3 py-5 pb-16 sm:px-0 sm:py-0'
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Playlist name' {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Describe your playlist' {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button disabled={create.isPending} type='submit' className='w-full'>
            {create.isPending && <Loader className='animate-spin' />}
            Create Playlist
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  )
}
