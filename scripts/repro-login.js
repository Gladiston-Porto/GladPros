const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  // small delay to allow dev server to start if needed
  await new Promise((r) => setTimeout(r, 1500));

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'dev@example.com', password: 'password123' })
    });

    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
