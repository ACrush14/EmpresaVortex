import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryFilter } from '../components/CategoryFilter'
import { ItemCard } from '../components/ItemCard'
import { fetchItems } from '../lib/api'
import type { Category, Item } from '../types/item'

const stats = [
  { label: 'Itens recirculados', value: '128' },
  { label: 'Doações no mês', value: '34' },
  { label: 'Usuários ativos', value: '210' },
]

export function LandingPage() {
  const [category, setCategory] = useState<Category | 'Todos'>('Todos')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchItems(category === 'Todos' ? undefined : { category })
      .then((data) => setItems(data.slice(0, 8)))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="flex flex-col gap-16 px-4 py-12">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Dê um novo destino ao que você não usa mais
        </h1>
        <p className="text-lg text-slate-600">
          O Desapego Universitário conecta estudantes da UNIFOR para doar ou vender livros,
          calculadoras, jalecos e outros itens de curso, incentivando a economia circular
          dentro do campus.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/anunciar"
            className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Anunciar item
          </Link>
          <Link
            to="/vitrine"
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
          >
            Buscar itens
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          >
            <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Últimos anúncios</h2>
          <Link to="/vitrine" className="text-sm font-medium text-emerald-600 hover:underline">
            Ver todos
          </Link>
        </div>

        <CategoryFilter selected={category} onChange={setCategory} />

        {loading ? (
          <p className="py-8 text-center text-slate-500">Carregando itens...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-slate-500">Nenhum item nessa categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
