(async()=>{
  try {
  const res = await fetch('http://localhost:3001/api/propostas');
    console.log('status', res.status);
    const txt = await res.text();
    console.log(txt.slice(0,1000));
  } catch (e) {
    console.error('fetch error', e);
  }
})()
