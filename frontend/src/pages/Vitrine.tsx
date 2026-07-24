import { useMemo, useState } from 'react'
import { CategoryFilter } from '../components/CategoryFilter'
import { ItemCard } from '../components/ItemCard'
import { mockItems } from '../lib/mockItems'
import type { Category } from '../types/item'

export function Vitrine() {
  const [category, setCategory] = useState<Category | 'Todos'>('Todos')
  const [search, setSearch] = useState('')

  const items = useMemo(() => {
    return mockItems.filter((item) => {
      const matchesCategory = category === 'Todos' || item.category === category
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Vitrine de itens</h1>

      <input
        type="search"
        placeholder="Buscar por título..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full max-w-sm rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-emerald-500"
      />

      <CategoryFilter selected={category} onChange={setCategory} />

      {items.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Nenhum item encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
