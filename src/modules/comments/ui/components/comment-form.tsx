import { z } from 'zod'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUser, useClerk } from '@clerk/nextjs'
import { commentInsertSchema } from '~/db/schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '~/components/ui/form'

import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { UserAvatar } from '~/components/user-avatar'
import { trpc } from '~/trpc/client'
interface CommentFormProps {
  videoId: string
  onSuccess?: () => void
}
export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
  const { user } = useUser()
  const { openSignIn } = useClerk()

  const createCommentSchema = commentInsertSchema.omit({
    userId: true
  })

  const utils = trpc.useUtils()

  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate()
      form.reset()
      toast.success('Comment added')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Something went wrong')
      if (error.data?.code === 'UNAUTHORIZED') {
        openSignIn()
      }
    }
  })

  const form = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
      videoId
    }
  })

  const handleSubmit = (values: z.infer<typeof createCommentSchema>) => {
    console.log('first')
    create.mutate(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex gap-4 group'
      >
        <UserAvatar
          name={user?.username || ''}
          imageUrl={user?.imageUrl || ''}
          size={'lg'}
        />
        <div className='flex-1'>
          <FormField
            name='content'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Add a comment...'
                    className='resize-none bg-transparent overflow-hidden min-h-0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='justify-end gap-2 mt-2 flex'>
            <Button disabled={create.isPending} type='submit' size='sm'>
              comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
