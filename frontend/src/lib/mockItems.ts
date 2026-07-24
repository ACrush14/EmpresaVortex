// Dados de exemplo só para visualizar o layout antes da API existir.
// Substituir por fetch em /items quando o backend estiver pronto (dia 6 do cronograma).
import type { Item } from '../types/item'

export const mockItems: Item[] = [
  {
    id: '1',
    title: 'Calculadora Científica HP 12C',
    description: 'Usada por 2 semestres, funcionando perfeitamente. Doação para calouro de Engenharia.',
    category: 'Engenharia',
    price: null,
    isDonation: true,
    imageUrl: 'https://picsum.photos/seed/calc/600/600',
    contact: 'fernanda@aluno.unifor.br',
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Livro Cálculo I - Stewart',
    description: '7ª edição, com algumas anotações a lápis.',
    category: 'Livros',
    price: 45,
    isDonation: false,
    imageUrl: 'https://picsum.photos/seed/livro/600/600',
    contact: '(85) 90000-0000',
    ownerId: 'user-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Jaleco branco tam. M',
    description: 'Pouco uso, ideal para quem está começando o curso.',
    category: 'Jalecos',
    price: 30,
    isDonation: false,
    imageUrl: 'https://picsum.photos/seed/jaleco/600/600',
    contact: 'lucas@aluno.unifor.br',
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Teclado mecânico',
    description: 'Trocando de setup, teclado sem fio em ótimo estado.',
    category: 'Computação',
    price: null,
    isDonation: true,
    imageUrl: 'https://picsum.photos/seed/teclado/600/600',
    contact: 'joao@aluno.unifor.br',
    ownerId: 'user-2',
    createdAt: new Date().toISOString(),
  },
]
