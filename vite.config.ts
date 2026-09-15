import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { generateReading, type ReadingRequest } from './api/_lib/reading'

/**
 * Serves /api/reading in dev the way Vercel does in production, so the page
 * never needs a mock. The key comes from .env (server-side only: no VITE_ prefix).
 */
function readingApi(env: Record<string, string>): Plugin {
  return {
    name: 'reading-api',
    configureServer(server) {
      server.middlewares.use('/api/reading', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        let body: ReadingRequest
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        } catch {
          res.statusCode = 400
          res.end('bad json')
          return
        }
        const out = await generateReading(body, env.ANTHROPIC_API_KEY)
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(out))
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), readingApi(env)],
    server: { port: 5192 }
  }
})
