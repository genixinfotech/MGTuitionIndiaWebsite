export function readPublicConfig(env) {
  return {
    supabaseUrl: (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim(),
    supabaseKey: (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || '').trim(),
  }
}

export function injectPublicConfig(html, config) {
  const payload = JSON.stringify(config).replace(/</g, '\\u003c')
  const script = `<script>window.__MG_PUBLIC_CONFIG__=${payload}</script>`
  if (html.includes('</head>')) {
    return html.replace('</head>', `    ${script}\n  </head>`)
  }
  return `${script}${html}`
}

export function createPublicConfigMiddleware(env) {
  return (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }
    const config = readPublicConfig(env)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    res.end(JSON.stringify({ ok: true, configured: Boolean(config.supabaseUrl && config.supabaseKey), ...config }))
  }
}
