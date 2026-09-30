import {BrowserRouter,Routes,Route,Link} from 'react-router-dom'
import {ShoppingBag,Lock,MessageCircle,MapPin,Instagram} from 'lucide-react'
import {ShopProvider,useShop,CFG,wa} from './lib.jsx'
import {CartDrawer} from './components.jsx'
import Store from './Store.jsx'
import Admin from './Admin.jsx'

function Layout({children}){
 const {count,setOpen}=useShop()
 return <>
  <div className="bg-wine px-4 py-2 text-center text-sm font-bold text-white">Personalizamos sin costo adicional. Pedidos y envíos coordinados por WhatsApp.</div>
  <header className="sticky top-0 z-30 border-b border-blush bg-cream/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-2">
   <Link to="/"><img src="/logo.png" alt="Boutique de Regalos Villapinzón" className="size-14 rounded-full"/></Link>
   <nav className="ml-auto flex items-center gap-5 font-extrabold text-wine-dark">
    <a className="hidden md:block" href="#productos">Productos</a><a className="hidden md:block" href="#nosotros">Quiénes somos</a><a className="hidden md:block" href="#ubicacion">¿Dónde nos ubicamos?</a>
    <Link to="/admin" className="flex items-center gap-1 text-sm text-muted"><Lock size={16}/>Admin</Link>
    <button className="btn" onClick={()=>setOpen(true)}><ShoppingBag size={20}/>Carrito{count>0&&<span className="grid size-6 place-items-center rounded-full bg-white text-sm text-wine">{count}</span>}</button></nav></div></header>
  <main>{children}</main>
  <footer className="mt-16 bg-wine-dark pb-24 pt-12 text-blush"><div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3">
   <div><img src="/logo.png" alt="" className="size-20 rounded-full"/><p className="mt-3 max-w-xs">Detalles con significado, hechos a tu medida en Villapinzón.</p></div>
   <div><h3 className="font-display text-xl font-bold text-white">Escríbenos</h3><a className="mt-2 flex items-center gap-2 underline" href={wa()} target="_blank" rel="noreferrer"><MessageCircle size={18}/>{CFG.PHONE}</a><a className="mt-2 flex items-center gap-2 underline" href={CFG.IG} target="_blank" rel="noreferrer"><Instagram size={18}/>@regalosvillapinzon</a></div>
   <div><h3 className="font-display text-xl font-bold text-white">Visítanos</h3><a className="mt-2 flex items-center gap-2 underline" href={CFG.MAPS} target="_blank" rel="noreferrer"><MapPin size={18}/>Ver punto físico en el mapa</a><Link to="/admin" className="mt-4 inline-flex items-center gap-2 text-sm opacity-80"><Lock size={14}/>Administración</Link></div></div></footer>
  <a href={wa('Hola, quisiera más información')} target="_blank" rel="noreferrer" className="fixed bottom-4 right-4 z-20 flex min-h-13 items-center gap-2 rounded-full bg-[#25D366] px-5 font-extrabold text-white shadow-lg"><MessageCircle/>WhatsApp</a>
  <CartDrawer/></>}

export default function App(){
 return <BrowserRouter><ShopProvider><Routes><Route path="/admin" element={<Admin/>}/><Route path="*" element={<Layout><Store/></Layout>}/></Routes></ShopProvider></BrowserRouter>}
