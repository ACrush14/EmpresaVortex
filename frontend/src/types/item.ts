import type { CATEGORIES } from '../lib/categories'

export type Category = (typeof CATEGORIES)[number]

export interface Item {
  id: string
  title: string
  description: string
  category: Category
  price: number | null
  isDonation: boolean
  imageUrl: string
  contact: string
  ownerId: string
  createdAt: string
}
