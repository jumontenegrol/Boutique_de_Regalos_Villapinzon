import {useMemo,useState} from 'react'
import {Gift,MessageCircle,Truck,Search,MapPin,ShoppingBag,PencilLine} from 'lucide-react'
import {useShop,fmt,wa,CFG,ICON} from './lib.jsx'
import {Img,ProductModal} from './components.jsx'

const perks=[[Gift,'Personalizado sin costo','Agendas, termos y tazas con tu nombre o frase, sin pagar de más.'],[MessageCircle,'Atención humana','Te respondemos por WhatsApp, sin formularios ni correos.'],[Truck,'Envío a tu medida','Coordinamos contigo la entrega y la forma de pago.']]
const steps=[[ShoppingBag,'Elige tus productos','Agrega al carrito lo que te guste y la cantidad que quieras.'],[PencilLine,'Déjanos tu nombre y celular','Si quieres personalizarlo, cuéntanos cómo. No tiene costo.'],[MessageCircle,'Te atendemos por WhatsApp','Confirmamos el pedido, el pago y el envío contigo.']]

export default function Store(){
 const {cats,prods,loading,error,set,setOpen}=useShop()
 const [cat,setCat]=useState(0),[q,setQ]=useState(''),[sort,setSort]=useState('new'),[view,setView]=useState(null)
 const list=useMemo(()=>{let l=prods.filter(p=>p.active&&(!cat||p.category_id==cat)&&p.name.toLowerCase().includes(q.toLowerCase()));if(sort!='new')l=[...l].sort((a,b)=>sort=='asc'?a.price-b.price:b.price-a.price);return l},[prods,cat,q,sort])
 const cur=cats.find(c=>c.id==cat),go=id=>{setCat(id);document.getElementById('productos')?.scrollIntoView()}
 return <>
 <section className="relative overflow-hidden"><div className="absolute -right-24 -top-24 size-96 rounded-full bg-blush"/><div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-blush/60"/>
  <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr]">
   <div><h1 className="h-display text-5xl md:text-6xl">Un detalle hecho a tu medida, para quien más quieres</h1>
    <p className="mt-5 max-w-xl text-xl">Agendas, termos, joyas, tazas y mucho más. Elige lo que te guste, arma tu carrito y nosotros te atendemos por WhatsApp.</p>
    <div className="mt-7 flex flex-wrap gap-3"><a href="#productos" className="btn">Ver productos</a><a href={wa('Hola, quisiera más información')} target="_blank" rel="noreferrer" className="btn btn-alt">Escríbenos</a></div></div>
   <div className="relative mx-auto"><img src="/logo.png" alt="Boutique de Regalos Villapinzón" className="size-64 rounded-full shadow-2xl shadow-wine/30 md:size-80"/><span className="absolute -left-4 bottom-6 rotate-[-6deg] rounded-2xl bg-white px-4 py-2 font-extrabold text-wine shadow-lg">Personalización gratis</span></div></div></section>

 <section className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">{perks.map(([I,t,d])=><div key={t} className="card flex gap-4 p-5"><I className="mt-1 shrink-0 text-wine" size={30}/><div><h3 className="font-display text-xl font-bold text-wine-dark">{t}</h3><p className="text-muted">{d}</p></div></div>)}</section>

 <section className="mx-auto mt-14 max-w-6xl px-5"><h2 className="h-display text-3xl md:text-4xl">¿Qué estás buscando?</h2>
  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{cats.map(c=><button key={c.id} onClick={()=>go(c.id)} className="card cursor-pointer p-4 text-left transition hover:border-wine hover:shadow-md"><span className="text-4xl">{ICON[c.slug]||'🎀'}</span><span className="mt-2 block font-extrabold text-wine-dark">{c.name}</span></button>)}</div></section>

 <section id="productos" className="mx-auto mt-14 max-w-6xl px-5"><h2 className="h-display text-3xl md:text-4xl">Nuestros productos</h2>
  <div className="mt-4 flex flex-wrap gap-3"><label className="relative min-w-60 flex-1"><Search className="absolute left-3 top-4 text-muted" size={20}/><input className="input !mt-0 !pl-10" placeholder="Buscar un producto" value={q} onChange={e=>setQ(e.target.value)}/></label>
   <select className="input !mt-0 !w-auto" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Ordenar"><option value="new">Más recientes</option><option value="asc">Precio: menor a mayor</option><option value="desc">Precio: mayor a menor</option></select></div>
  <div className="mt-4 flex flex-wrap gap-2">{[{id:0,name:'Todo'},...cats].map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`min-h-11 cursor-pointer rounded-full border-2 border-wine px-4 font-bold ${cat==c.id?'bg-wine text-white':'bg-white text-wine'}`}>{c.name}</button>)}</div>
  {cur?.note&&<p className="mt-4 rounded-2xl bg-blush p-4 font-semibold">💬 {cur.note}</p>}
  {error&&<p className="mt-4 rounded-2xl bg-red-50 p-4 text-red-800">No pudimos cargar los productos. Recarga la página o escríbenos por WhatsApp.</p>}
  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
   {loading?[...Array(4)].map((_,i)=><div key={i} className="card aspect-[3/4] animate-pulse bg-blush/60"/>)
   :list.map(p=><article key={p.id} className="card flex flex-col overflow-hidden transition hover:shadow-lg">
    <button onClick={()=>setView(p)} aria-label={`Ver ${p.name}`} className="relative aspect-square cursor-pointer"><Img p={p}/>{p.stock>0&&p.stock<=2&&<span className="absolute left-3 top-3 rounded-full bg-wine px-3 py-1 text-sm font-bold text-white">Últimas unidades</span>}</button>
    <div className="flex flex-1 flex-col gap-1 p-4"><h3 className="font-display text-lg font-bold text-wine-dark">{p.name}</h3><p className="font-display text-2xl font-extrabold text-wine">{fmt(p.price)}</p>
     {p.stock>0?<button className="btn mt-auto" onClick={()=>{set(p,1);setOpen(true)}}>Agregar al carrito</button>:<p className="mt-auto font-extrabold text-muted">Agotado</p>}</div></article>)}</div>
  {!loading&&!list.length&&<p className="mt-6 text-lg">No encontramos productos con esa búsqueda. ¿Nos escribes por WhatsApp? Quizás lo tenemos.</p>}</section>

 <section className="mx-auto mt-16 max-w-6xl px-5"><h2 className="h-display text-3xl md:text-4xl">Comprar es muy fácil</h2>
  <ol className="mt-5 grid gap-4 md:grid-cols-3">{steps.map(([I,t,d],i)=><li key={t} className="card p-5"><span className="grid size-11 place-items-center rounded-full bg-wine font-display text-xl font-bold text-white">{i+1}</span><h3 className="mt-3 flex items-center gap-2 font-display text-xl font-bold text-wine-dark"><I size={22}/>{t}</h3><p className="text-muted">{d}</p></li>)}</ol></section>

 <section id="nosotros" className="mx-auto mt-16 max-w-6xl px-5"><div className="rounded-3xl bg-blush p-8 md:p-12"><h2 className="h-display text-3xl md:text-4xl">Quiénes somos</h2><p className="mt-3 max-w-2xl text-lg">Somos Boutique de Regalos, un negocio de Villapinzón dedicado a los detalles con significado. Personalizamos agendas, termos y tazas, y te ayudamos a elegir el regalo ideal para cada ocasión. <em>(Edita este texto con la historia de tu tienda.)</em></p></div></section>

 <section id="ubicacion" className="mx-auto mt-16 max-w-6xl px-5"><h2 className="h-display text-3xl md:text-4xl">¿Dónde nos ubicamos?</h2><p className="mt-3 flex items-center gap-2 text-lg"><MapPin className="text-wine"/>{CFG.ADDRESS}</p>
  <div className="mt-4 flex flex-wrap gap-3"><a className="btn" href={CFG.MAPS} target="_blank" rel="noreferrer"><MapPin size={20}/>Ver en Google Maps</a><a className="btn btn-alt" href={wa('Hola, ¿cómo llego a su punto físico?')} target="_blank" rel="noreferrer">Preguntar por WhatsApp</a></div></section>
 {view&&<ProductModal p={view} onClose={()=>setView(null)}/>}</>}
