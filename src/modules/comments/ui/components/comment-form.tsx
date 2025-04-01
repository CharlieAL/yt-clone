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
  onCancel?: () => void
  parentId?: string
  variant?: 'reply' | 'comment'
}
export const CommentForm = ({
  videoId,
  onSuccess,
  onCancel,
  variant = 'comment',
  parentId
}: CommentFormProps) => {
  const { user } = useUser()
  const { openSignIn } = useClerk()

  const createCommentSchema = commentInsertSchema.omit({
    userId: true
  })

  const utils = trpc.useUtils()

  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId })
      utils.comments.getMany.invalidate({ videoId, parentId })
      toast.success('Comment added')
      onSuccess?.()
      form.reset()
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
      videoId,
      parentId
    }
  })

  const handleSubmit = (values: z.infer<typeof createCommentSchema>) => {
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
          size={variant === 'comment' ? 'lg' : 'sm'}
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
                    placeholder={
                      variant === 'comment'
                        ? 'Add a public comment...'
                        : 'Add a reply...'
                    }
                    className='resize-none bg-transparent overflow-hidden min-h-0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='justify-end gap-2 mt-2 flex'>
            {onCancel && (
              <Button
                onClick={() => {
                  onCancel()
                  form.reset()
                }}
                variant='ghost'
                size='sm'
                className='h-8'
              >
                Cancel
              </Button>
            )}
            <Button disabled={create.isPending} type='submit' size='sm'>
              {variant === 'comment' ? 'Comment' : 'Reply'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
