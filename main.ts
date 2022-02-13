import App from './app.tsx';
import { h, renderSSR, Helmet } from './deps/nano.ts'
import { serve } from 'https://deno.land/std@0.116.0/http/server.ts'

const ssr = renderSSR(h(App, {}))
const { body, head, footer } = Helmet.SSR(ssr)

const html = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head.join('\n')}
  </head>
  <body>
    ${body}
    ${footer.join('\n')}
  </body>
  <script src="https://unpkg.com/nano-jsx/bundles/nano.slim.min.js"></script>
  <script>
    window.onload = () => {
      const app = document.getElementById('app')
      nanoJSX.hydrate(app, ${JSON.stringify(ssr)})
</html>`

const addr = ':8080'

const handler = (_request: Request): Response => {
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })

  //return new Response('404', { status: 404 })
}

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`)
await serve(handler, { addr })
