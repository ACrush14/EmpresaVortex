import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início' },
  { to: '/vitrine', label: 'Vitrine' },
  { to: '/anunciar', label: 'Anunciar' },
  { to: '/meus-anuncios', label: 'Meus Anúncios' },
]

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'
  }`

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-lg font-semibold text-slate-900">
          🌱 Desapego Universitário
        </NavLink>

        <nav className="flex flex-wrap items-center gap-4">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/identificacao"
          className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
        >
          Identificar-se
        </NavLink>
      </div>
    </header>
  )
}
