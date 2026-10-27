const BASE="http://localhost:3000", CDP="http://localhost:9222";
const [path,label,w="1440",h="900",shot]=process.argv.slice(2);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tab=await (await fetch(`${CDP}/json/new?about:blank`,{method:"PUT"})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener("open",r));
let id=0;
const send=(m,p)=>new Promise(res=>{const i=++id;const hh=e=>{const x=JSON.parse(e.data);if(x.id===i){ws.removeEventListener("message",hh);res(x.result);}};ws.addEventListener("message",hh);ws.send(JSON.stringify({id:i,method:m,params:p}));});
const ev=e=>send("Runtime.evaluate",{expression:e,returnByValue:true}).then(r=>r.result.value);
await send("Page.enable",{});await send("Runtime.enable",{});
await send("Emulation.setDeviceMetricsOverride",{width:+w,height:+h,deviceScaleFactor:1,mobile:false});
await send("Page.navigate",{url:BASE+path}); await sleep(3500);
const box=await ev(`(()=>{const a=[...document.querySelectorAll('nav[aria-label="Main"] a')].find(x=>x.textContent.trim().toLowerCase()==="${label}".toLowerCase());if(!a)return null;const r=a.getBoundingClientRect();return JSON.stringify({x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)});})()`);
if(!box){console.log("nav link not found:",label);process.exit(1);}
const {x,y}=JSON.parse(box);
await send("Input.dispatchMouseEvent",{type:"mouseMoved",x,y,buttons:0});
await sleep(1400);
console.log(await ev(`(()=>{
  const vw=document.documentElement.clientWidth;
  const grid=[...document.querySelectorAll('div.shell.flex.items-start')].find(g=>g.offsetParent!==null);
  if(!grid) return "mega menu grid not found";
  const gr=grid.getBoundingClientRect();
  const kids=[...grid.children].map(k=>{const r=k.getBoundingClientRect();const cs=getComputedStyle(k);
    return \`  \${(k.textContent||'').trim().slice(0,22).padEnd(24)} left=\${Math.round(r.left)} right=\${Math.round(r.right)} w=\${Math.round(r.width)}  col=\${cs.gridColumn}\`;}).join("\\n");
  return \`viewport \${vw}\\ngrid  left=\${Math.round(gr.left)} right=\${Math.round(gr.right)} w=\${Math.round(gr.width)}\\ndocScrollW=\${document.documentElement.scrollWidth}\\nchildren:\\n\${kids}\`;
})()`));
if(shot){const r=await send("Page.captureScreenshot",{format:"jpeg",quality:72});
await (await import("node:fs")).promises.writeFile(shot,Buffer.from(r.data,"base64"));console.log("saved",shot);}
ws.close();
