const fetch = require('node-fetch')

async function run() {
  const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gladpros.local' }),
  })
  const data = await res.json()
  console.log(data)
}
run().catch(console.error)
