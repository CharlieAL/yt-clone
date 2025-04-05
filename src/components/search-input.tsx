'use client'

import { Search, XIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { APP_URL } from '~/constants'

export const SearchInput = () => {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('categoryId') || ''
  const query = searchParams.get('query') || ''
  const [value, setValue] = useState(query)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = new URL('/search', APP_URL)
    const newQuery = value.trim()
    if (categoryId) {
      url.searchParams.set('categoryId', categoryId)
    }
    url.searchParams.set('query', encodeURIComponent(newQuery))
    if (newQuery === '') {
      url.searchParams.delete('query')
    }

    setValue(newQuery)
    router.push(url.toString())
  }

  return (
    <form className='w-full relative flex group' onSubmit={handleSearch}>
      <div className='relative w-full'>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Search'
          className='w-full pl-5 rounded-l-full border  focus:border-blue-400 outline-none h-10 pr-12'
          name='search'
          autoComplete='off'
        />
        {value && (
          <Button
            type='button'
            variant={'ghost'}
            size='icon'
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full z-10'
            onClick={() => setValue('')}
          >
            <XIcon className='text-gray-400' />
          </Button>
        )}
      </div>

      <Button
        disabled={!value.trim()}
        variant={'outline'}
        size='icon'
        type='submit'
        className='rounded-l-none rounded-r-full w-16  border-l-0 py-2.5 h-10'
      >
        <Search className='text-primary/25 size-5 ' />
      </Button>
    </form>
  )
}
