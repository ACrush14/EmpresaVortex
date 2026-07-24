import { useState } from 'react'

export function Identification() {
  const [name, setName] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    // TODO: decidir mecanismo (nome em localStorage vs. login JWT real) — Camada 2
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Identifique-se</h1>
      <p className="text-sm text-slate-500">
        Informe seu nome para anunciar itens e acompanhar seus anúncios.
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
