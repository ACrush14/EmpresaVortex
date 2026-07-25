import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteItem, fetchItems } from '../lib/api'
import { getCurrentOwnerId } from '../lib/currentUser'
import type { Item } from '../types/item'

export function MyAds() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems({ ownerId: getCurrentOwnerId() })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    const previous = items
    setItems((current) => current.filter((item) => item.id !== id))

    try {
      await deleteItem(id)
    } catch {
      setItems(previous)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Meus anúncios</h1>
        <Link
          to="/anunciar"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Novo anúncio
        </Link>
      </div>

      {loading ? (
        <p className="py-8 text-center text-slate-500">Carregando seus anúncios...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">Você ainda não tem nenhum anúncio.</p>
          <Link to="/anunciar" className="mt-2 inline-block text-emerald-600 hover:underline">
            Criar meu primeiro anúncio
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.category}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
