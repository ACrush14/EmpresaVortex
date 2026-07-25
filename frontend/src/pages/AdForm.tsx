import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'
import { ApiError, createItem } from '../lib/api'
import { getCurrentOwnerId } from '../lib/currentUser'
import type { Category } from '../types/item'

type Field = 'title' | 'description' | 'price' | 'imageUrl' | 'contact'
type FieldErrors = Partial<Record<Field, string>>

function validate(input: {
  title: string
  description: string
  isDonation: boolean
  price: string
  imageUrl: string
  contact: string
}): FieldErrors {
  const errors: FieldErrors = {}

  if (!input.title.trim()) errors.title = 'Informe um título'
  if (!input.description.trim()) errors.description = 'Informe uma descrição'

  if (!input.isDonation) {
    const priceValue = Number(input.price)
    if (!input.price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      errors.price = 'Informe um preço maior que zero'
    }
  }

  if (!input.imageUrl.trim()) {
    errors.imageUrl = 'Informe a URL da imagem'
  } else {
    try {
      new URL(input.imageUrl)
    } catch {
      errors.imageUrl = 'URL da imagem inválida'
    }
  }

  if (!input.contact.trim()) errors.contact = 'Informe um contato (WhatsApp ou e-mail)'

  return errors
}

const inputClass = (hasError: boolean) =>
  `rounded-lg border px-3 py-2 text-slate-900 outline-none ${
    hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-300 focus:border-emerald-500'
  }`

export function AdForm() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [isDonation, setIsDonation] = useState(true)
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [contact, setContact] = useState('')

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    const errors = validate({ title, description, isDonation, price, imageUrl, contact })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await createItem({
        title,
        description,
        category,
        isDonation,
        price: isDonation ? null : Number(price),
        imageUrl,
        contact,
        ownerId: getCurrentOwnerId(),
      })
      navigate('/meus-anuncios')
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.issues?.length) {
        const backendErrors: FieldErrors = {}
        for (const issue of submitError.issues) {
          const field = issue.path[0]
          if (
            field === 'title' ||
            field === 'description' ||
            field === 'price' ||
            field === 'imageUrl' ||
            field === 'contact'
          ) {
            backendErrors[field] = issue.message
          }
        }
        setFieldErrors(backendErrors)
        if (Object.keys(backendErrors).length === 0) {
          setFormError(submitError.issues[0].message)
        }
      } else {
        setFormError('Não foi possível publicar o anúncio. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Anunciar item</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Título
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass(Boolean(fieldErrors.title))}
          />
          {fieldErrors.title && <span className="text-xs text-red-600">{fieldErrors.title}</span>}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Descrição
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={inputClass(Boolean(fieldErrors.description))}
          />
          {fieldErrors.description && (
            <span className="text-xs text-red-600">{fieldErrors.description}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className={inputClass(false)}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-start gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isDonation}
              onChange={(event) => {
                setIsDonation(event.target.checked)
                setFieldErrors((current) => ({ ...current, price: undefined }))
              }}
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
                className={inputClass(Boolean(fieldErrors.price))}
              />
              {fieldErrors.price && (
                <span className="text-xs text-red-600">{fieldErrors.price}</span>
              )}
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
            className={inputClass(Boolean(fieldErrors.imageUrl))}
          />
          {fieldErrors.imageUrl && (
            <span className="text-xs text-red-600">{fieldErrors.imageUrl}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Contato (WhatsApp ou e-mail)
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className={inputClass(Boolean(fieldErrors.contact))}
          />
          {fieldErrors.contact && (
            <span className="text-xs text-red-600">{fieldErrors.contact}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}
