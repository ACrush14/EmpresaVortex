import { useState } from 'react'
import { CATEGORIES } from '../lib/categories'
import type { Category } from '../types/item'

export function AdForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [isDonation, setIsDonation] = useState(true)
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [contact, setContact] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    // TODO: integrar com POST /items quando o backend estiver pronto
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Anunciar item</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Título
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Descrição
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isDonation}
              onChange={(event) => setIsDonation(event.target.checked)}
            />
            É doação
          </label>

          {!isDonation && (
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
              Preço (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                required
              />
            </label>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          URL da imagem
          <input
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Contato (WhatsApp ou e-mail)
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Publicar
        </button>
      </form>
    </div>
  )
}
