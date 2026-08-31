async function load(){
const files=["bundle.b64.0.txt","bundle.b64.1.txt","bundle.b64.2.txt","bundle.b64.3.txt"];
const parts=await Promise.all(files.map(f=>fetch(new URL(f,import.meta.url)).then(r=>{if(!r.ok)throw new Error("Failed "+f);return r.text()})));
const bin=Uint8Array.from(atob(parts.map(p=>p.trim()).join("")),c=>c.charCodeAt(0));
const js=new TextDecoder().decode(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
const u=URL.createObjectURL(new Blob([js],{type:"text/javascript"}));
await import(u)
}
load().catch(e=>{console.error(e);document.body.innerHTML="<pre style=\"padding:2rem;font:14px monospace\">Failed to load game bundle.\n"+e+"</pre>"})
