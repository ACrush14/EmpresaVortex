import type { Item } from '../types/item'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  issues?: { path: (string | number)[]; message: string }[]

  constructor(message: string, issues?: { path: (string | number)[]; message: string }[]) {
    super(message)
    this.issues = issues
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.error ?? 'Erro ao comunicar com o servidor', body?.issues)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type NewItemInput = Omit<Item, 'id' | 'createdAt'>

export function fetchItems(filters?: { category?: string; ownerId?: string }): Promise<Item[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.set('category', filters.category)
  if (filters?.ownerId) params.set('ownerId', filters.ownerId)
  const query = params.toString()

  return request<Item[]>(`/items${query ? `?${query}` : ''}`)
}

export function fetchItem(id: string): Promise<Item> {
  return request<Item>(`/items/${id}`)
}

export function createItem(input: NewItemInput): Promise<Item> {
  return request<Item>('/items', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteItem(id: string): Promise<void> {
  return request<void>(`/items/${id}`, { method: 'DELETE' })
}
