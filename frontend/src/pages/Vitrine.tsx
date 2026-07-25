import { useEffect, useMemo, useState } from 'react'
import { CategoryFilter } from '../components/CategoryFilter'
import { ItemCard } from '../components/ItemCard'
import { fetchItems } from '../lib/api'
import type { Category, Item } from '../types/item'

export function Vitrine() {
  const [category, setCategory] = useState<Category | 'Todos'>('Todos')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchItems(category === 'Todos' ? undefined : { category })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [category])

  const visibleItems = useMemo(() => {
    return items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
  }, [items, search])

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

      {loading ? (
        <p className="py-12 text-center text-slate-500">Carregando itens...</p>
      ) : visibleItems.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Nenhum item encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
