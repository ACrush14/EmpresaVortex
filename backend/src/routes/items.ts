import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { createItemSchema } from '../schemas/item.js'

export const itemsRouter = Router()

itemsRouter.get('/', async (req, res) => {
  const { category, ownerId } = req.query

  const items = await prisma.item.findMany({
    where: {
      ...(typeof category === 'string' ? { category } : {}),
      ...(typeof ownerId === 'string' ? { ownerId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(items)
})

itemsRouter.get('/:id', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } })

  if (!item) {
    res.status(404).json({ error: 'Item não encontrado' })
    return
  }

  res.json(item)
})

itemsRouter.post('/', async (req, res) => {
  const result = createItemSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({ error: 'Dados inválidos', issues: result.error.issues })
    return
  }

  const { price, isDonation, ...rest } = result.data

  const item = await prisma.item.create({
    data: {
      ...rest,
      isDonation,
      price: isDonation ? null : (price ?? null),
    },
  })

  res.status(201).json(item)
})

itemsRouter.delete('/:id', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } })

  if (!item) {
    res.status(404).json({ error: 'Item não encontrado' })
    return
  }

  await prisma.item.delete({ where: { id: req.params.id } })
  res.status(204).send()
})
