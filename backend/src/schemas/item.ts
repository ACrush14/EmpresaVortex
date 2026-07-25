import { z } from 'zod'

// Precisa ficar em sync com frontend/src/lib/categories.ts (fonte da verdade das categorias)
export const CATEGORIES = [
  'Livros',
  'Engenharia',
  'Computação',
  'Eletrônicos',
  'Jalecos',
  'Móveis',
  'Outros',
] as const

export const createItemSchema = z
  .object({
    title: z.string().trim().min(1, 'Título é obrigatório'),
    description: z.string().trim().min(1, 'Descrição é obrigatória'),
    category: z.enum(CATEGORIES),
    isDonation: z.boolean(),
    price: z.number().positive().nullable().optional(),
    imageUrl: z.string().trim().url('URL da imagem inválida'),
    contact: z.string().trim().min(1, 'Contato é obrigatório'),
    ownerId: z.string().trim().min(1, 'ownerId é obrigatório'),
  })
  .refine((data) => data.isDonation || (data.price !== null && data.price !== undefined), {
    message: 'Informe um preço quando o item não é doação',
    path: ['price'],
  })

export type CreateItemInput = z.infer<typeof createItemSchema>
