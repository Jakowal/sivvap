/// <reference types="vite/client" />

declare const __VAULT_PATH__: string

declare module 'virtual:vault-dates' {
  const dates: Record<string, string | null>
  export default dates
}
