/** @jsx h */
import { h, renderSSR, Helmet } from './deps/nano.ts'
import { serve } from 'https://deno.land/std@0.116.0/http/server.ts'


const comments = ['Hey! This is the first comment.', 'Hi, from another comment!']

const App = () => (
  <div>
    <Helmet>
      <title>Nano JSX SSR</title>
      <meta name="description" content="Server Side Rendered Nano JSX Application" />
    </Helmet>


    <h2>Comments</h2>

    <div id="comments">
    </div>
  </div>
)

const ssr = renderSSR(<App />)
const { body, head, footer } = Helmet.SSR(ssr)

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head.join('\n')}
  </head>
  <body>
    ${body}
    ${footer.join('\n')}
  </body>
</html>`

const addr = ':8080'

const handler = (request: Request): Response => {
  if (request.url === 'http://localhost:8080/') {
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  }

  return new Response('404', { status: 404 })
}

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`)
await serve(handler, { addr })
