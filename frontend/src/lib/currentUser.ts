import { useSyncExternalStore } from 'react'

const ID_KEY = 'desapego:ownerId'
const NAME_KEY = 'desapego:userName'

export type CurrentUser = {
  id: string
  name: string | null
}

type Listener = () => void
const listeners = new Set<Listener>()

function notify() {
  for (const listener of listeners) listener()
}

function getOrCreateId(): string {
  const stored = localStorage.getItem(ID_KEY)
  if (stored) return stored

  const id = crypto.randomUUID()
  localStorage.setItem(ID_KEY, id)
  return id
}

// useSyncExternalStore exige que getSnapshot devolva a MESMA referência
// enquanto nada mudou (senão o React re-renderiza pra sempre, achando que
// o estado mudou a cada leitura). Por isso o objeto é cacheado aqui e só
// recriado quando id/name realmente mudam.
let cachedUser: CurrentUser | null = null

function getSnapshot(): CurrentUser {
  const id = getOrCreateId()
  const name = localStorage.getItem(NAME_KEY)

  if (!cachedUser || cachedUser.id !== id || cachedUser.name !== name) {
    cachedUser = { id, name }
  }

  return cachedUser
}

// Identificação simples (Camada 2): sem senha, sem backend de auth — o nome
// digitado fica salvo neste navegador, junto do id anônimo que já existia.
// Trocar por login real depois deve significar só reescrever o que tem
// aqui dentro; quem chama (Header, AdForm, MyAds) continua usando
// getCurrentUser()/identify() sem saber como a identidade é obtida por baixo.
export function getCurrentUser(): CurrentUser {
  return getSnapshot()
}

export function identify(name: string): void {
  localStorage.setItem(NAME_KEY, name.trim())
  notify()
}

export function signOut(): void {
  // Remove o id também, não só o nome: senão a próxima pessoa a usar este
  // navegador herdaria os anúncios de quem saiu (mesmo ownerId continuaria).
  localStorage.removeItem(NAME_KEY)
  localStorage.removeItem(ID_KEY)
  notify()
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Pra componentes que precisam re-renderizar quando a identidade muda
// (ex.: o Header, que fica montado entre navegações).
export function useCurrentUser(): CurrentUser {
  return useSyncExternalStore(subscribe, getSnapshot)
}
