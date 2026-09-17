import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // .env centralizado na raiz do projeto (um nível acima de client/), não
  // em client/.env — assim front e back lêem o mesmo arquivo.
  envDir: '..',
  plugins: [
    react(),
    tailwindcss(),
  ],
})