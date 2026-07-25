const STORAGE_KEY = 'desapego:ownerId'

// Identificação mínima até a Camada 2 (login/JWT) existir: cada navegador
// recebe um id anônimo persistido, só para associar itens ao "dono" que criou.
export function getCurrentOwnerId(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored

  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
