'use client'

import SearchBar from '@/components/SearchBar'
import { useState } from 'react'

export default function MyFoodSearchBar() {
  const [search, setSearch] = useState('')

  return <SearchBar isDesktop={true} search={search} setSearch={setSearch} />
}
