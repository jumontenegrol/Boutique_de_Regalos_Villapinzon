import {useCallback,useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {LogOut,Store,Plus,Pencil,Trash2,Upload,X,Star} from 'lucide-react'
import {useShop,sb,fmt,uploadImages} from './lib.jsx'
import {Img} from './components.jsx'

const ST={pendiente:'Pendiente',confirmado:'Confirmado',enviado:'Enviado',entregado:'Entregado',cancelado:'Cancelado'},NX={confirmado:['enviado','Marcar enviado'],enviado:['entregado','Marcar entregado']}
const TAG={pendiente:'bg-amber-200',confirmado:'bg-green-200',enviado:'bg-sky-200',entregado:'bg-green-300',cancelado:'bg-gray-300'}
const wph=p=>(p.length==10?'57':'')+p

export default function Admin(){
 const [st,setSt]=useState('load'),[orders,setOrders]=useState([]),[tab,setTab]=useState('orders'),{reload}=useShop()
 const loadOrders=useCallback(async()=>{const {data}=await sb.from('orders').select('*,customers(name,phone),order_items(qty,unit_price,products(name))').order('created_at',{ascending:false});setOrders(data||[])},[])
 const check=useCallback(async()=>{if(!sb)return setSt('nosb');const {data:{session}}=await sb.auth.getSession();if(!session)return setSt('login');const {data}=await sb.from('admins').select('user_id').maybeSingle();if(!data)return setSt('deny');await Promise.all([reload(),loadOrders()]);setSt('ok')},[reload,loadOrders])
 useEffect(()=>{check()},[check])
 const refresh=()=>Promise.all([loadOrders(),reload()])
 if(st!='ok')return <Gate st={st} check={check}/>
 const pend=orders.filter(o=>o.status=='pendiente').length
 return <div className="min-h-screen">
  <div className="border-b border-blush bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3"><img src="/logo.png" alt="" className="size-12 rounded-full"/><h1 className="h-display text-2xl">Panel de administración</h1>
   <Link to="/" className="btn btn-alt ml-auto"><Store size={18}/>Ver tienda</Link><button className="btn btn-alt" onClick={async()=>{await sb.auth.signOut();setSt('login')}}><LogOut size={18}/>Salir</button></div></div>
  <div className="mx-auto max-w-6xl px-5 py-5"><div className="flex flex-wrap gap-2">{[['orders',`Pedidos${pend?` (${pend} pendientes)`:''}`],['products','Productos y stock'],['stats','Estadísticas']].map(([k,v])=><button key={k} onClick={()=>setTab(k)} className={`min-h-11 cursor-pointer rounded-full border-2 border-wine px-5 font-bold ${tab==k?'bg-wine text-white':'bg-white text-wine'}`}>{v}</button>)}</div>
   <div className="mt-5">{tab=='orders'?<Orders orders={orders} refresh={refresh}/>:tab=='products'?<Products refresh={refresh}/>:<Stats orders={orders}/>}</div></div></div>}

function Gate({st,check}){
 const [f,setF]=useState({e:'',p:''}),[err,setErr]=useState('')
 const login=async e=>{e.preventDefault();const {error}=await sb.auth.signInWithPassword({email:f.e,password:f.p});error?setErr('Correo o contraseña incorrectos.'):check()}
 return <div className="grid min-h-screen place-items-center p-5"><div className="card w-full max-w-sm p-6"><img src="/logo.png" alt="" className="mx-auto size-20 rounded-full"/><h1 className="h-display mt-3 text-center text-2xl">Ingreso de administrador</h1>
  {st=='load'?<p className="mt-4 text-center">Cargando…</p>:st=='nosb'?<p className="mt-4">Falta configurar <b>VITE_SUPABASE_URL</b> y <b>VITE_SUPABASE_ANON_KEY</b> en el archivo .env.</p>
  :st=='deny'?<><p className="mt-4">Esta cuenta no tiene permisos de administrador.</p><button className="btn mt-4 w-full" onClick={async()=>{await sb.auth.signOut();check()}}>Salir</button></>
  :<form onSubmit={login}><label className="label">Correo<input className="input" type="email" autoComplete="username" value={f.e} onChange={e=>setF({...f,e:e.target.value})} required/></label><label className="label">Contraseña<input className="input" type="password" autoComplete="current-password" value={f.p} onChange={e=>setF({...f,p:e.target.value})} required/></label>{err&&<p role="alert" className="mt-3 font-bold text-red-700">{err}</p>}<button className="btn mt-5 w-full">Entrar</button></form>}
  <Link to="/" className="mt-4 block text-center underline">Volver a la tienda</Link></div></div>}

function Orders({orders,refresh}){
 const [f,setF]=useState('pendiente'),list=orders.filter(o=>f=='todos'||o.status==f)
 const act=async fn=>{const {error}=await fn();if(error)alert(error.message);refresh()}
 return <><div className="flex flex-wrap gap-2">{['todos',...Object.keys(ST)].map(s=><button key={s} onClick={()=>setF(s)} className={`min-h-10 cursor-pointer rounded-full border px-4 font-bold ${f==s?'bg-ink text-white':'bg-white'}`}>{s=='todos'?'Todos':ST[s]}</button>)}</div>
 {list.map(o=>{const c=o.customers||{name:'?',phone:''},nx=NX[o.status];return <div key={o.id} className="card mt-3 p-4">
  <div className="flex flex-wrap items-center gap-3"><b className="text-lg">{o.number}</b><span className={`rounded-full px-3 text-sm font-bold ${TAG[o.status]}`}>{ST[o.status]}</span><small className="text-muted">{new Date(o.created_at).toLocaleString('es-CO')}</small></div>
  <p>{c.name} — <a className="font-bold text-wine underline" href={`https://wa.me/${wph(c.phone)}`} target="_blank" rel="noreferrer">{c.phone}</a></p>
  <ul className="my-2 list-disc pl-5">{o.order_items.map((i,k)=><li key={k}>{i.qty} x {i.products?.name} — {fmt(i.qty*i.unit_price)}</li>)}</ul>
  {o.personalization&&<p className="rounded-xl bg-blush p-3"><b>Personalización:</b> {o.personalization}</p>}
  <p className="mt-2 text-lg font-extrabold">Total {fmt(o.total)}</p>
  <div className="mt-3 flex flex-wrap gap-2">{o.status=='pendiente'&&<><button className="btn" onClick={()=>window.confirm('¿Ya recibiste el pago de este pedido? Se descontará el stock.')&&act(()=>sb.rpc('confirm_order',{p_id:o.id}))}>Confirmar pago y descontar stock</button><button className="btn btn-alt" onClick={()=>window.confirm('¿Cancelar este pedido?')&&act(()=>sb.from('orders').update({status:'cancelado'}).eq('id',o.id))}>Cancelar</button></>}
   {nx&&<button className="btn" onClick={()=>act(()=>sb.from('orders').update({status:nx[0]}).eq('id',o.id))}>{nx[1]}</button>}</div></div>})}
 {!list.length&&<p className="mt-4">No hay pedidos en este estado.</p>}</>}

function Products({refresh}){
 const {prods,cats}=useShop(),[ed,setEd]=useState(null)
 const patch=async(p,k,v)=>{const {error}=await sb.from('products').update({[k]:v}).eq('id',p.id);error?alert(error.message):refresh()}
 const del=async p=>{if(!window.confirm(`¿Eliminar "${p.name}"?`))return;const {error}=await sb.from('products').delete().eq('id',p.id);error?alert('Este producto ya tiene pedidos y no se puede eliminar. Mejor ocúltalo desmarcando "Visible".'):refresh()}
 return <><button className="btn" onClick={()=>setEd({})}><Plus size={20}/>Nuevo producto</button>
 <div className="mt-4 space-y-3">{prods.map(p=><div key={p.id} className="card grid grid-cols-[4rem_1fr] items-center gap-3 p-3 md:grid-cols-[4rem_1fr_7rem_7rem_auto_auto]"><div className="size-16 overflow-hidden rounded-xl"><Img p={p}/></div>
  <div><b>{p.name}</b><div className="text-sm text-muted">{cats.find(c=>c.id==p.category_id)?.name}</div></div>
  <label className="text-sm font-bold">Precio<input className="input !min-h-10" type="number" defaultValue={p.price} onBlur={e=>+e.target.value!=p.price&&patch(p,'price',+e.target.value)}/></label>
  <label className="text-sm font-bold">Stock<input className={`input !min-h-10 ${p.stock<=2?'!border-red-500':''}`} type="number" defaultValue={p.stock} onBlur={e=>+e.target.value!=p.stock&&patch(p,'stock',+e.target.value)}/></label>
  <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="size-5" checked={p.active} onChange={e=>patch(p,'active',e.target.checked)}/>Visible</label>
  <div className="flex gap-2"><button aria-label="Editar" className="btn btn-alt !px-3" onClick={()=>setEd(p)}><Pencil size={18}/></button><button aria-label="Eliminar" className="btn btn-alt !px-3" onClick={()=>del(p)}><Trash2 size={18}/></button></div></div>)}
 {!prods.length&&<p>Aún no hay productos. Crea el primero con el botón de arriba.</p>}</div>
 {ed&&<Editor p={ed} cats={cats} onClose={()=>setEd(null)} onSaved={()=>{setEd(null);refresh()}}/>}</>}

function Editor({p,cats,onClose,onSaved}){
 const [f,setF]=useState({name:p.name||'',category_id:p.category_id||cats[0]?.id,price:p.price??'',stock:p.stock??'',description:p.description||'',active:p.active??true}),[imgs,setImgs]=useState(p.images||[]),[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[err,setErr]=useState('')
 const add=l=>setFiles(x=>[...x,...[...l].filter(i=>i.type.startsWith('image/'))]),s=k=>e=>setF({...f,[k]:e.target.value})
 async function save(e){e.preventDefault();setBusy(true);setErr('')
  try{const urls=await uploadImages(files),row={...f,category_id:+f.category_id,price:+f.price,stock:+f.stock,images:[...imgs,...urls]},{error}=p.id?await sb.from('products').update(row).eq('id',p.id):await sb.from('products').insert(row);if(error)throw error;onSaved()}
  catch(x){setErr(x.message||'No se pudo guardar. Revisa las fotos e inténtalo de nuevo.');setBusy(false)}}
 return <div className="fixed inset-0 z-40 grid place-items-center bg-ink/60 p-4"><form onSubmit={save} className="max-h-[94vh] w-full max-w-2xl overflow-auto rounded-3xl bg-cream p-6">
  <div className="flex items-center justify-between"><h2 className="h-display text-2xl">{p.id?'Editar producto':'Nuevo producto'}</h2><button type="button" aria-label="Cerrar" onClick={onClose} className="cursor-pointer p-2"><X/></button></div>
  <label className="label">Nombre<input className="input" value={f.name} onChange={s('name')} required/></label>
  <label className="label">Categoría<select className="input" value={f.category_id} onChange={s('category_id')}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <div className="grid grid-cols-2 gap-3"><label className="label">Precio (COP)<input className="input" type="number" min="0" value={f.price} onChange={s('price')} required/></label><label className="label">Stock<input className="input" type="number" min="0" value={f.stock} onChange={s('stock')} required/></label></div>
  <label className="label">Descripción<textarea className="input" rows="3" value={f.description} onChange={s('description')}/></label>
  <p className="label">Fotos</p>
  <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();add(e.dataTransfer.files)}} className="mt-1 flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-wine bg-white p-6 text-center font-bold text-wine"><Upload size={28}/>Elige las fotos desde tu computador o arrástralas aquí<span className="text-sm font-normal text-muted">Puedes subir varias. Se optimizan automáticamente.</span><input type="file" accept="image/*" multiple hidden onChange={e=>{add(e.target.files);e.target.value=''}}/></label>
  <div className="mt-3 flex flex-wrap gap-3">{imgs.map((u,i)=><div key={u} className="relative size-24 overflow-hidden rounded-xl border-2 border-blush"><img src={u} alt="" className="h-full w-full object-cover"/>{i==0?<span className="absolute bottom-1 left-1 rounded bg-wine px-1 text-xs font-bold text-white">Principal</span>:<button type="button" aria-label="Hacer principal" onClick={()=>setImgs([u,...imgs.filter(x=>x!=u)])} className="absolute bottom-1 left-1 cursor-pointer rounded bg-white/90 p-1"><Star size={14}/></button>}<button type="button" aria-label="Quitar foto" onClick={()=>setImgs(imgs.filter(x=>x!=u))} className="absolute right-1 top-1 cursor-pointer rounded-full bg-white/90 p-1"><X size={14}/></button></div>)}
   {files.map((fl,i)=><div key={i} className="relative size-24 overflow-hidden rounded-xl border-2 border-dashed border-wine"><img src={URL.createObjectURL(fl)} alt="" className="h-full w-full object-cover"/><button type="button" aria-label="Quitar foto" onClick={()=>setFiles(files.filter((_,k)=>k!=i))} className="absolute right-1 top-1 cursor-pointer rounded-full bg-white/90 p-1"><X size={14}/></button></div>)}</div>
  <label className="mt-4 flex items-center gap-2 font-bold"><input type="checkbox" className="size-5" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/>Visible en la tienda</label>
  {err&&<p role="alert" className="mt-3 font-bold text-red-700">{err}</p>}
  <div className="mt-5 flex gap-3"><button disabled={busy} className="btn flex-1">{busy?'Guardando…':'Guardar producto'}</button><button type="button" className="btn btn-alt" onClick={onClose}>Cancelar</button></div></form></div>}

function Stats({orders}){
 const {prods}=useShop(),sold=orders.filter(o=>['confirmado','enviado','entregado'].includes(o.status)),rev=sold.reduce((s,o)=>s+o.total,0),top={},fr={}
 sold.forEach(o=>o.order_items.forEach(i=>{const n=i.products?.name||'?';top[n]=(top[n]||0)+i.qty}));orders.forEach(o=>{const n=`${o.customers?.name} (${o.customers?.phone})`;fr[n]=(fr[n]||0)+1})
 const lst=(m,u)=>Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=><li key={k}>{k} — <b>{v}</b> {u}</li>)
 const days=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-6+i);return[x,orders.filter(o=>new Date(o.created_at).toDateString()==x.toDateString()&&o.status!='cancelado').length]}),mx=Math.max(1,...days.map(d=>d[1]))
 const K=[['Ventas confirmadas',fmt(rev)],['Pedidos totales',orders.length],['Pendientes por confirmar',orders.filter(o=>o.status=='pendiente').length],['Ticket promedio',fmt(sold.length?Math.round(rev/sold.length):0)]]
 return <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{K.map(([t,v])=><div key={t} className="card p-4">{t}<b className="block font-display text-3xl text-wine">{v}</b></div>)}</div>
 <div className="card mt-3 p-4"><h3 className="font-display text-xl font-bold">Pedidos de los últimos 7 días</h3><div className="mt-3 flex h-40 items-end gap-3">{days.map(([x,c])=><div key={+x} className="flex h-full flex-1 flex-col justify-end text-center text-sm"><span>{c}</span><i className="block min-h-0.5 rounded-t-lg bg-wine" style={{height:`${c/mx*80}%`}}/><span className="text-muted">{x.toLocaleDateString('es-CO',{weekday:'short'})}</span></div>)}</div></div>
 <div className="mt-3 grid gap-3 md:grid-cols-3"><div className="card p-4"><h3 className="font-display text-xl font-bold">Más vendidos</h3><ul className="mt-2">{lst(top,'uds')}</ul></div><div className="card p-4"><h3 className="font-display text-xl font-bold">Clientes frecuentes</h3><ul className="mt-2">{lst(fr,'pedidos')}</ul></div>
  <div className="card p-4"><h3 className="font-display text-xl font-bold">Stock bajo (2 o menos)</h3><ul className="mt-2">{prods.filter(p=>p.stock<=2).map(p=><li key={p.id}>{p.name} — <b>{p.stock}</b></li>)}</ul></div></div></>}
