import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'

const items = [
  {
    title: 'Calculadora Científica HP 12C',
    description:
      'Usada por 2 semestres, funcionando perfeitamente. Doação para calouro de Engenharia.',
    category: 'Engenharia',
    price: null,
    isDonation: true,
    imageUrl: 'https://picsum.photos/seed/calc/600/600',
    contact: 'fernanda@aluno.unifor.br',
    ownerId: 'user-1',
  },
  {
    title: 'Livro Cálculo I - Stewart',
    description: '7ª edição, com algumas anotações a lápis.',
    category: 'Livros',
    price: 45,
    isDonation: false,
    imageUrl: 'https://picsum.photos/seed/livro/600/600',
    contact: '(85) 90000-0000',
    ownerId: 'user-2',
  },
  {
    title: 'Jaleco branco tam. M',
    description: 'Pouco uso, ideal para quem está começando o curso.',
    category: 'Jalecos',
    price: 30,
    isDonation: false,
    imageUrl: 'https://picsum.photos/seed/jaleco/600/600',
    contact: 'lucas@aluno.unifor.br',
    ownerId: 'user-1',
  },
  {
    title: 'Teclado mecânico',
    description: 'Trocando de setup, teclado sem fio em ótimo estado.',
    category: 'Computação',
    price: null,
    isDonation: true,
    imageUrl: 'https://picsum.photos/seed/teclado/600/600',
    contact: 'joao@aluno.unifor.br',
    ownerId: 'user-2',
  },
]

async function main() {
  await prisma.item.deleteMany()
  await prisma.item.createMany({ data: items })
  console.log(`Seed concluído: ${items.length} itens criados.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
