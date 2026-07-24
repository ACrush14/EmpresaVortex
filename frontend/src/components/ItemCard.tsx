import { Link } from 'react-router-dom'
import type { Item } from '../types/item'

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      to={`/itens/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {item.category}
        </span>

        <h3 className="line-clamp-2 font-semibold text-slate-900">{item.title}</h3>

        <span
          className={`mt-auto w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            item.isDonation
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {item.isDonation ? 'Doação' : `R$ ${item.price?.toFixed(2)}`}
        </span>
      </div>
    </Link>
  )
}
