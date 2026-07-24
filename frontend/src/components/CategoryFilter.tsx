import { CATEGORIES } from '../lib/categories'
import type { Category } from '../types/item'

const ALL = 'Todos' as const

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: Category | typeof ALL
  onChange: (category: Category | typeof ALL) => void
}) {
  const options: Array<Category | typeof ALL> = [ALL, ...CATEGORIES]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            selected === option
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
