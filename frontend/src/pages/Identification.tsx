import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { identify, signOut, useCurrentUser } from '../lib/currentUser'

export function Identification() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const [name, setName] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    identify(name)
    navigate('/meus-anuncios')
  }

  if (currentUser.name) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Você é {currentUser.name}</h1>
        <p className="text-sm text-slate-500">
          Seus anúncios ficam associados a esse nome neste navegador.
        </p>
        <button
          type="button"
          onClick={() => navigate('/meus-anuncios')}
          className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Ver meus anúncios
        </button>
        <button
          type="button"
          onClick={signOut}
          className="text-sm font-medium text-slate-500 hover:text-red-600"
        >
          Sair / trocar nome
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Identifique-se</h1>
      <p className="text-sm text-slate-500">
        Informe seu nome para anunciar itens e acompanhar seus anúncios. Sem senha — o nome fica
        salvo neste navegador.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome"
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          required
        />

        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
