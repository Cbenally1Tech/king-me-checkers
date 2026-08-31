(async()=>{
  const u=(p)=>fetch(new URL(p,import.meta.url)).then(r=>r.text());
  const parts=await Promise.all([0,1,2,3,4,5,6,7].map(i=>u(`./bundle.b64.part${i}.txt`)));
  const b64=parts.join('').trim();
  const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const js=new TextDecoder().decode(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const s=document.createElement('script');
  s.type='module';
  s.textContent=js;
  document.head.appendChild(s);
})();