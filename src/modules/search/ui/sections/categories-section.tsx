'use client'

import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import FilterCarousel from '~/components/filter-carousel'
import { trpc } from '~/trpc/client'

interface CategoriesSectionProps {
  categoryId?: string
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<FilterCarousel isLoading />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const router = useRouter()
  const [categories] = trpc.categories.getMany.useSuspenseQuery()
  const data = categories.map((category) => ({
    label: category.name,
    value: category.id
  }))

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set('categoryId', value)
    } else {
      url.searchParams.delete('categoryId')
    }

    router.push(url.toString())
  }
  return <FilterCarousel onSelect={onSelect} data={data} value={categoryId} />
}
