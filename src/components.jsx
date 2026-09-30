import {useState} from 'react'
import {X,Plus,Minus,Trash2,Check,MessageCircle} from 'lucide-react'
import {useShop,sb,fmt,wa} from './lib.jsx'

export const Img=({p,i=0})=>p.images?.[i]?<img src={p.images[i]} alt={p.name} loading="lazy" className="h-full w-full object-cover"/>:<div className="grid h-full w-full place-items-center bg-blush text-4xl">🎁</div>

export function ProductModal({p,onClose}){
 const {set,setOpen}=useShop(),[i,setI]=useState(0)
 return <div className="fixed inset-0 z-40 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
  <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} className="relative grid max-h-[92vh] w-full max-w-4xl gap-6 overflow-auto rounded-3xl bg-cream p-5 md:grid-cols-2">
   <button aria-label="Cerrar" onClick={onClose} className="absolute right-3 top-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-white/90"><X/></button>
   <div><div className="aspect-square overflow-hidden rounded-2xl"><Img p={p} i={i}/></div>
    {p.images?.length>1&&<div className="mt-2 flex flex-wrap gap-2">{p.images.map((u,k)=><button key={u} onClick={()=>setI(k)} aria-label={`Foto ${k+1}`} className={`size-16 cursor-pointer overflow-hidden rounded-lg border-2 ${k==i?'border-wine':'border-blush'}`}><img src={u} alt="" className="h-full w-full object-cover"/></button>)}</div>}</div>
   <div className="flex flex-col"><h2 className="h-display text-3xl">{p.name}</h2><p className="my-2 font-display text-3xl font-extrabold text-wine">{fmt(p.price)}</p><p className="whitespace-pre-line">{p.description}</p>
    <p className="mt-3 rounded-xl bg-blush p-3 text-sm">Personalizamos sin costo adicional. Podrás contarnos los detalles al hacer tu pedido.</p>
    {p.stock>0?<button className="btn mt-4 w-full md:mt-auto" onClick={()=>{set(p,1);onClose();setOpen(true)}}>Agregar al carrito</button>:<p className="mt-4 font-extrabold text-muted md:mt-auto">Agotado</p>}</div></div></div>}

export function CartDrawer(){
 const {items,prods,set,clear,open,setOpen}=useShop(),[f,setF]=useState({n:'',p:'',t:''}),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[done,setDone]=useState(null)
 const rows=Object.entries(items).map(([id,q])=>[prods.find(p=>p.id==id),q]).filter(([p])=>p),tot=rows.reduce((s,[p,q])=>s+p.price*q,0)
 const close=()=>{setOpen(false);setDone(null);setErr('')}
 async function submit(e){e.preventDefault();const ph=f.p.replace(/\D/g,'')
  if(f.n.trim().length<2)return setErr('Escribe tu nombre.');if(ph.length!=10)return setErr('Escribe tu celular completo, de 10 dígitos.')
  setBusy(true);setErr('');let num='BR-DEMO'
  if(sb){const {data,error}=await sb.rpc('create_order',{p_name:f.n,p_phone:ph,p_personalization:f.t,p_items:rows.map(([p,q])=>({id:p.id,qty:q}))});if(error){setBusy(false);return setErr('No pudimos guardar tu pedido. Inténtalo de nuevo o escríbenos por WhatsApp.')}num=data}
  const msg=`Hola 👋 Quiero confirmar mi pedido *${num}*\n\n${rows.map(([p,q])=>`• ${q} x ${p.name} — ${fmt(p.price*q)}`).join('\n')}\n\n*Total: ${fmt(tot)}*\nNombre: ${f.n}\nCelular: ${ph}${f.t.trim()?`\nPersonalización: ${f.t}`:''}`
  clear();setBusy(false);setDone({num,url:wa(msg)})}
 return <>{open&&<div className="fixed inset-0 z-40 bg-ink/50" onClick={close}/>}
 <aside aria-label="Carrito" className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-auto bg-white p-5 shadow-2xl transition-transform ${open?'':'invisible translate-x-full'}`}>
  <div className="flex items-center justify-between"><h2 className="h-display text-3xl">Tu carrito</h2><button aria-label="Cerrar carrito" onClick={close} className="grid size-12 cursor-pointer place-items-center"><X/></button></div>
  {done?<div className="py-8 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 text-green-700"><Check size={36}/></span><h3 className="h-display mt-4 text-2xl">¡Pedido {done.num} creado!</h3><p className="mt-2">Último paso: envíanos el resumen por WhatsApp para confirmar el pago y coordinar el envío.</p><a href={done.url} target="_blank" rel="noreferrer" className="btn mt-6 w-full !min-h-14 text-lg"><MessageCircle/>Abrir WhatsApp</a><button onClick={close} className="mt-4 cursor-pointer underline">Seguir viendo productos</button></div>
  :!rows.length?<p className="py-12 text-center text-lg">Tu carrito está vacío. Elige algo bonito 🎁</p>
  :<form onSubmit={submit}><ul>{rows.map(([p,q])=><li key={p.id} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 border-b border-blush py-3"><div className="size-16 overflow-hidden rounded-xl"><Img p={p}/></div>
    <div><strong>{p.name}</strong><div>{fmt(p.price)}</div><div className="mt-1 flex items-center gap-3"><button type="button" aria-label="Quitar uno" onClick={()=>set(p,-1)} className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-wine text-wine"><Minus size={18}/></button><b className="w-6 text-center">{q}</b><button type="button" aria-label="Agregar uno" onClick={()=>set(p,1)} disabled={q>=p.stock} className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-wine text-wine disabled:opacity-40"><Plus size={18}/></button></div></div>
    <button type="button" aria-label="Quitar producto" onClick={()=>set(p,-q)} className="cursor-pointer p-2 text-muted"><Trash2/></button></li>)}</ul>
   <p className="my-3 font-display text-2xl font-extrabold text-wine-dark">Total: {fmt(tot)}</p>
   <label className="label">Tu nombre<input className="input" value={f.n} onChange={e=>setF({...f,n:e.target.value})} autoComplete="name"/></label>
   <label className="label">Tu número de celular<input className="input" type="tel" inputMode="tel" placeholder="300 123 4567" value={f.p} onChange={e=>setF({...f,p:e.target.value})} autoComplete="tel"/></label>
   <label className="label">¿Quieres personalizar tu pedido? (opcional)<textarea className="input" rows="3" placeholder="Ej.: el nombre para la agenda, color o frase" value={f.t} onChange={e=>setF({...f,t:e.target.value})}/></label>
   <p className="mt-2 rounded-xl bg-blush p-3 text-sm font-semibold">La personalización no tiene ningún costo adicional.</p>
   {err&&<p role="alert" className="mt-3 font-bold text-red-700">{err}</p>}
   <button disabled={busy} className="btn mt-4 w-full !min-h-14 text-lg">{busy?'Guardando tu pedido…':'Realizar pedido'}</button><p className="mt-2 text-sm text-muted">Después te llevamos a WhatsApp para confirmar, pagar y coordinar el envío.</p></form>}
 </aside></>}
