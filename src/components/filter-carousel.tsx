'use client'

import { cn } from '~/lib/utils'
import { useEffect, useState } from 'react'

import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
  CarouselApi
} from '~/components/ui/carousel'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'

interface FilterCarouselProps {
  value?: string | null
  isLoading?: boolean
  onSelect?: (value: string | null) => void
  data?: {
    label: string
    value: string
  }[]
}

const FilterCarousel = ({
  value,
  isLoading,
  onSelect,
  data
}: FilterCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])
  return (
    <div className='relative w-full'>
      <div
        className={cn(
          'absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none',
          current === 1 && 'hidden'
        )}
      />
      <Carousel
        opts={{ align: 'start' }}
        className='w-full px-12'
        setApi={setApi}
      >
        <CarouselContent className='-ml-3'>
          {!isLoading ? (
            <>
              <CarouselItem
                className='basis-auto pl-3'
                onClick={() => {
                  onSelect?.(null)
                }}
              >
                <Badge
                  variant={!value ? 'default' : 'secondary'}
                  className='rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm font-normal'
                >
                  ALl
                </Badge>
              </CarouselItem>
              {data?.map((item) => (
                <CarouselItem
                  key={item.value}
                  className='basis-auto pl-3'
                  onClick={() => onSelect?.(item.value)}
                >
                  <Badge
                    variant={value === item.value ? 'default' : 'secondary'}
                    className='rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm font-normal'
                  >
                    {item.label}
                  </Badge>
                </CarouselItem>
              ))}
            </>
          ) : (
            Array.from({ length: 14 }).map((_, i) => (
              <CarouselItem key={i} className='basis-auto pl-3'>
                <Skeleton className='rounded-lg px-3 py-1 h-full w-[100px] text-sm font-semibold'>
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
        <CarouselPrevious className='left-0 z-20' />
        <CarouselNext className='right-0 z-20' />
      </Carousel>
      <div
        className={cn(
          'absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none',
          current === count && 'hidden'
        )}
      />
    </div>
  )
}

export default FilterCarousel
