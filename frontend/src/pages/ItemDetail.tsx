import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchItem } from '../lib/api'
import type { Item } from '../types/item'

export function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchItem(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="px-4 py-16 text-center text-slate-500">Carregando item...</p>
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-slate-500">Item não encontrado.</p>
        <Link to="/vitrine" className="mt-4 inline-block text-emerald-600 hover:underline">
          Voltar para a vitrine
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Link to="/vitrine" className="text-sm font-medium text-emerald-600 hover:underline">
        ← Voltar para a vitrine
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img src={item.imageUrl} alt={item.title} className="aspect-video w-full object-cover" />

        <div className="flex flex-col gap-3 p-6">
          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {item.category}
          </span>

          <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
          <p className="text-slate-600">{item.description}</p>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
              item.isDonation ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {item.isDonation ? 'Doação' : `R$ ${item.price?.toFixed(2)}`}
          </span>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Contato do anunciante</p>
            <p className="text-slate-900">{item.contact}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
