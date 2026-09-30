import {createContext,useCallback,useContext,useEffect,useState} from 'react'
import {createClient} from '@supabase/supabase-js'
const {VITE_SUPABASE_URL:U,VITE_SUPABASE_ANON_KEY:K}=import.meta.env
export const sb=U&&K?createClient(U,K):null
export const CFG={WA:'573005554942',PHONE:'+57 300 555 4942',IG:'https://www.instagram.com/regalosvillapinzon',ADDRESS:'Villapinzón, Cundinamarca (agrega aquí la dirección exacta)',MAPS:'https://www.google.com/maps/search/?api=1&query=Villapinz%C3%B3n+Cundinamarca'}
export const fmt=n=>'$'+Number(n).toLocaleString('es-CO')
export const wa=t=>`https://wa.me/${CFG.WA}${t?'?text='+encodeURIComponent(t):''}`
export const ICON={agendas:'📓',termos:'🥤',joyas:'💍',cajas:'🎁',tazas:'☕',bolsos:'👜',peluches:'🧸',cafe:'🫘'}
const slugs=Object.keys(ICON),names=['Agendas','Termos','Joyas','Cajas para ocasiones especiales','Tazas personalizables','Bolsos','Peluches','Para hacer café']
const DEMO={cats:names.map((name,i)=>({id:i+1,name,slug:slugs[i],note:i==4?'Las tazas llevan más detalles: te recomendamos escribirnos por WhatsApp para diseñarla contigo.':''})),
prods:[[1,'Agenda Flores 2026',38000],[2,'Termo de acero 500 ml',52000],[3,'Collar dije corazón',29000],[4,'Caja sorpresa de cumpleaños',65000],[5,'Taza con tu nombre',24000],[7,'Peluche oso abrazable',45000]].map(([c,name,price],i)=>({id:'d'+i,category_id:c,name,price,stock:i==2?2:8,active:true,images:[],description:'Producto de ejemplo. Al conectar Supabase verás aquí tus productos reales.'}))}

// Reduce la foto (máx. 1200 px, webp) antes de subirla a Supabase Storage
async function compress(file,max=1200){const b=await createImageBitmap(file),r=Math.min(1,max/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*r);c.height=Math.round(b.height*r);c.getContext('2d').drawImage(b,0,0,c.width,c.height);return new Promise(ok=>c.toBlob(ok,'image/webp',.85))}
export async function uploadImages(files){const urls=[];for(const f of files){const blob=await compress(f),path=`${crypto.randomUUID()}.webp`,{error}=await sb.storage.from('products').upload(path,blob,{contentType:'image/webp'});if(error)throw error;urls.push(sb.storage.from('products').getPublicUrl(path).data.publicUrl)}return urls}

const Ctx=createContext()
export const useShop=()=>useContext(Ctx)
export function ShopProvider({children}){
 const [d,setD]=useState({cats:[],prods:[],loading:true,error:null}),[items,setItems]=useState(()=>{try{return JSON.parse(localStorage.br_cart)||{}}catch{return{}}}),[open,setOpen]=useState(false)
 const reload=useCallback(async()=>{if(!sb)return setD({cats:DEMO.cats,prods:DEMO.prods,loading:false,error:null});const [c,p]=await Promise.all([sb.from('categories').select('*').order('id'),sb.from('products').select('*').order('created_at',{ascending:false})]);setD({cats:c.data||[],prods:p.data||[],loading:false,error:c.error||p.error})},[])
 useEffect(()=>{reload()},[reload]);useEffect(()=>{localStorage.br_cart=JSON.stringify(items)},[items])
 const set=(p,d)=>setItems(c=>{const q=Math.max(0,Math.min(p.stock,(c[p.id]||0)+d)),n={...c};q?n[p.id]=q:delete n[p.id];return n})
 return <Ctx.Provider value={{...d,reload,items,set,clear:()=>setItems({}),open,setOpen,count:Object.values(items).reduce((a,b)=>a+b,0)}}>{children}</Ctx.Provider>}
