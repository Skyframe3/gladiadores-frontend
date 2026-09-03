// ── ESTILOS DINÁMICOS SIN unsafe-inline ──
// Las plantillas ya no escriben style="..." (el CSP lo bloquearía sin
// 'unsafe-inline'): escriben data-css="..." y este observador lo vuelca a
// el.style.cssText, que entra por el CSSOM y el CSP sí permite. Corre como
// microtarea al final de cada render, antes del pintado, así que el
// elemento nunca se alcanza a ver sin su estilo.
(function(){
  function aplicar(el){
    if(el.nodeType!==1)return;
    if(el.hasAttribute('data-css'))el.style.cssText=el.getAttribute('data-css');
    el.querySelectorAll('[data-css]').forEach(n=>{n.style.cssText=n.getAttribute('data-css');});
  }
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(aplicar)))
    .observe(document.documentElement,{childList:true,subtree:true});
  aplicar(document.documentElement);
})();

// Catálogo de respaldo. Al cargar se reemplaza con lo que el admin
// tenga publicado en el panel; si la API no responde, se usa esto.
let lastFilter='todas';
let ROUTES=[
 {id:1,name:"Senderos y Cascada",tag:"POPULAR",exp:"panoramica",img:"img/rutas/senderos-y-cascada/foto-1.avif",gal:1,galeria:["img/rutas/senderos-y-cascada/foto-1.avif"],diff:"MODERADA",dur:"3 hrs",dist:"45 km",desc:"Recorrido 4x4 por parque ecoturístico, mirador y cascada. Perfecta para contemplar y vivir el off road al mismo tiempo.",terrain:["Mirador","Cascada","Bosque"],horarios:["10:00","15:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:1800},{personas:2,precio:2300}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3000}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3000},{personas:3,precio:3800},{personas:4,precio:4600}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:4000}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:4000},{personas:3,precio:4800},{personas:4,precio:5600}]}]},
 {id:2,name:"Ruta Gran Mirador",tag:"EXTREMA",exp:"extrema",img:"img/i5.avif",gal:8,diff:"EXTREMA",dur:"3 hrs",dist:"80 km",desc:"La ruta más extrema. El mejor mirador de la Sierra Norte. Bosque, rocas y subidas que ponen a prueba todo.",terrain:["Mirador","Rocas","Extremo"],horarios:["09:00","12:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:2600},{personas:2,precio:2800}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3800}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3800},{personas:3,precio:4300},{personas:4,precio:4800}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:4800}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:4800},{personas:3,precio:5300},{personas:4,precio:5800}]}]},
 {id:3,name:"Ruta del Río",tag:"AVENTURA",exp:"panoramica",img:"img/rutas/ruta-del-rio/foto-1.avif",gal:12,galeria:["img/rutas/ruta-del-rio/foto-1.avif","img/rutas/ruta-del-rio/foto-2.avif","img/rutas/ruta-del-rio/foto-3.avif","img/rutas/ruta-del-rio/foto-4.avif","img/rutas/ruta-del-rio/foto-5.avif","img/rutas/ruta-del-rio/foto-6.avif","img/rutas/ruta-del-rio/foto-7.avif","img/rutas/ruta-del-rio/foto-8.avif","img/rutas/ruta-del-rio/foto-9.avif","img/rutas/ruta-del-rio/foto-10.avif","img/rutas/ruta-del-rio/foto-11.avif","img/rutas/ruta-del-rio/foto-12.avif"],diff:"MODERADA",dur:"1 hr",dist:"50 km",desc:"Primera experiencia perfecta. Muchos cruces de río, bosque abundante y ambiente familiar. Ideal para todos.",terrain:["Río","Bosque","Familiar"],horarios:["10:00","12:00","14:00","16:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:1200},{personas:2,precio:1400}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:2100}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:2100},{personas:3,precio:2600},{personas:4,precio:3100}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3100}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3100},{personas:3,precio:3600},{personas:4,precio:4100}]}]},
 {id:4,name:"La Ruta Clásica",tag:"FAMILIAR",exp:"panoramica",img:"img/rutas/la-ruta-clasica/foto-1.avif",gal:9,galeria:["img/rutas/la-ruta-clasica/foto-1.avif","img/rutas/la-ruta-clasica/foto-2.avif","img/rutas/la-ruta-clasica/foto-3.avif","img/rutas/la-ruta-clasica/foto-4.avif","img/rutas/la-ruta-clasica/foto-5.avif","img/rutas/la-ruta-clasica/foto-6.avif","img/rutas/la-ruta-clasica/foto-7.avif","img/rutas/la-ruta-clasica/foto-8.avif","img/rutas/la-ruta-clasica/foto-9.avif"],diff:"MODERADA",dur:"1.5 hrs",dist:"38 km",desc:"La ruta que siempre recomendarán. Cueva, fábrica abandonada, río y senderos. Clásica por algo.",terrain:["Clásica","Cueva","Río"],horarios:["10:00","12:00","14:00","16:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:1500},{personas:2,precio:1700}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:2300}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:2300},{personas:3,precio:2800},{personas:4,precio:3300}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3300}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3300},{personas:3,precio:3800},{personas:4,precio:4300}]}]},
 {id:5,name:"Aventura Nocturna",tag:"ESPECIAL",exp:"extrema",img:"img/rutas/aventura-nocturna/foto-1.avif",gal:6,galeria:["img/rutas/aventura-nocturna/foto-1.avif","img/rutas/aventura-nocturna/foto-2.avif","img/rutas/aventura-nocturna/foto-3.avif","img/rutas/aventura-nocturna/foto-4.avif","img/rutas/aventura-nocturna/foto-5.avif","img/rutas/aventura-nocturna/foto-6.avif"],diff:"MODERADA",dur:"1 hr 50 min",dist:"35 km",desc:"El bosque de noche es otro mundo. Recorrido nocturno con el cielo estrellado como techo y la adrenalina multiplicada.",terrain:["Nocturno","Bosque","Estrellas"],horarios:["18:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:1700},{personas:2,precio:1900}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:2700}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:2700},{personas:3,precio:3200},{personas:4,precio:3700}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3700}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3700},{personas:3,precio:4200},{personas:4,precio:4700}]}]},
 {id:6,name:"Luciérnagas",tag:"TEMPORADA",exp:"panoramica",img:"img/rutas/luciernagas/foto-1.avif",gal:1,galeria:["img/rutas/luciernagas/foto-1.avif"],diff:"MODERADA",dur:"3+ hrs",dist:"25 km",desc:"Una de las experiencias más mágicas de México. Temporada limitada: el bosque se ilumina con miles de luciérnagas.",terrain:["Luciérnagas","Bosque","Temporada"],horarios:["18:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:2200},{personas:2,precio:2600}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3300}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3300},{personas:3,precio:3800},{personas:4,precio:4400}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:4300}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:4300},{personas:3,precio:4800},{personas:4,precio:5400}]}]},
 {id:7,name:"Amanecer en la Montaña",tag:"AVENTURA",exp:"panoramica",img:"img/rutas/amanecer-en-la-montana/foto-1.avif",gal:11,galeria:["img/rutas/amanecer-en-la-montana/foto-1.avif","img/rutas/amanecer-en-la-montana/foto-2.avif","img/rutas/amanecer-en-la-montana/foto-3.avif","img/rutas/amanecer-en-la-montana/foto-4.avif","img/rutas/amanecer-en-la-montana/foto-5.avif","img/rutas/amanecer-en-la-montana/foto-6.avif","img/rutas/amanecer-en-la-montana/foto-7.avif","img/rutas/amanecer-en-la-montana/foto-8.avif","img/rutas/amanecer-en-la-montana/foto-9.avif","img/rutas/amanecer-en-la-montana/foto-10.avif","img/rutas/amanecer-en-la-montana/foto-11.avif"],diff:"AVANZADA",dur:"3+ hrs",dist:"55 km",desc:"Sal antes del alba. Llega al mirador justo cuando el sol rompe el horizonte sobre la Sierra Norte. Imposible de olvidar.",terrain:["Amanecer","Montaña","Paisaje"],horarios:["05:30"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:2800},{personas:2,precio:3000}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:4100}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:4100},{personas:3,precio:4300},{personas:4,precio:4800}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:5100}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:5100},{personas:3,precio:5300},{personas:4,precio:5800}]}]},
 {id:8,name:"Experiencia Mezcal",tag:"CULTURAL",exp:"panoramica",img:"img/rutas/experiencia-mezcal/foto-1.avif",gal:1,galeria:["img/rutas/experiencia-mezcal/foto-1.avif"],diff:"MODERADA",dur:"2.5 hrs",dist:"42 km",desc:"Off road y cultura local. Recorre senderos hasta conocer el proceso artesanal del mezcal de la Sierra Norte de Puebla.",terrain:["Mezcal","Cultura","Senderos"],horarios:["11:00","15:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:1700},{personas:2,precio:2200}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:2800}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:2800},{personas:3,precio:3600},{personas:4,precio:4300}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3800}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3800},{personas:3,precio:4600},{personas:4,precio:5300}]}]},
 {id:9,name:"Expedición al Volcán",tag:"ÉPICA",exp:"extrema",img:"img/rutas/expedicion-al-volcan/foto-1.avif",gal:7,galeria:["img/rutas/expedicion-al-volcan/foto-1.avif","img/rutas/expedicion-al-volcan/foto-2.avif","img/rutas/expedicion-al-volcan/foto-3.avif","img/rutas/expedicion-al-volcan/foto-4.avif","img/rutas/expedicion-al-volcan/foto-5.avif","img/rutas/expedicion-al-volcan/foto-6.avif","img/rutas/expedicion-al-volcan/foto-7.avif"],diff:"AVANZADA",dur:"2 hrs",dist:"60 km",desc:"El volcán más cercano a Chignahuapan. Off road de alto nivel con vistas que no tienen comparación en toda la Sierra Norte.",terrain:["Volcán","Paisaje","Extremo"],horarios:["10:00","15:00"],
   units:[]},
 {id:10,name:"Cascada Iluminada",tag:"NOCTURNA",exp:"extrema",img:"img/i5.avif",gal:5,diff:"MODERADA",dur:"3 hrs",dist:"45 km",desc:"Parque iluminado, cascada y experiencia 4x4 nocturna. Principalmente viernes, sábado, domingo y fechas especiales.",terrain:["Nocturno","Cascada","Iluminación"],horarios:["18:00"],
   units:[
     {id:"cuatrimoto-2",name:"Cuatrimoto",type:"ATV 2 plazas",seats:2,booked:[],tarifas:[{personas:1,precio:1900},{personas:2,precio:2600}]},
     {id:"commander-2",name:"Commander Trail",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:3200}]},
     {id:"commander-4",name:"Commander Max",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:3200},{personas:3,precio:4200},{personas:4,precio:4900}]},
     {id:"maverick-2",name:"Maverick X3",type:"SSV 2 plazas",seats:2,booked:[],tarifas:[{personas:2,precio:4200}]},
     {id:"maverick-4",name:"Maverick X3 MAX",type:"SSV 4 plazas",seats:4,booked:[],tarifas:[{personas:2,precio:4200},{personas:3,precio:5200},{personas:4,precio:5900}]}]}
];
// 12 unidades propias por categoría comercial
// (documento de definición, sección 2). Los apodos individuales de cada
// máquina viven en el backend (models/Unidad.js) y salen por /api/disponibilidad.
// uid empata con el id de categoría del catálogo (cuatrimoto-2, commander-4...),
// así la foto no depende de que el nombre coincida letra por letra.
const UNITS_FLEET=[
 {uid:"cuatrimoto-2",img:"img/i18.png",cat:"ATV CUATRIMOTO",name:"Cuatrimoto",seats:"2 plazas",qty:"2 unidades",tag:"Ágil y potente"},
 {uid:"commander-2",img:"img/unidades/commander-trail.avif",cat:"SSV COMPACTO",name:"Commander Trail",seats:"2 plazas",qty:"1 unidad",tag:"Compacta para parejas"},
 {uid:"commander-4",img:"img/unidades/commander-4p.avif",cat:"SSV FAMILIAR",name:"Commander Max",seats:"4 plazas",qty:"3 unidades",tag:"Ideal para grupos"},
 {uid:"maverick-4",img:"img/unidades/maverick-x3-max-4p.avif",cat:"SSV MÁXIMO RENDIMIENTO",name:"Maverick X3 MAX",seats:"4 plazas",qty:"5 unidades",tag:"Máximo rendimiento"},
 {uid:"maverick-2",img:"img/unidades/maverick-x3-rs-2p.avif",cat:"SSV BIPLAZA",name:"Maverick X3",seats:"2 plazas",qty:"1 unidad",tag:"Adrenalina en pareja"}
];
// Tienda temporalmente agotada: todo sale con sold:true. Guantes y Linterna
// se retiraron del catálogo. Para reactivar una pieza, quítale sold:true.
const MERCH=[{id:1,emo:"",name:"Visor Táctico",price:450,tag:"PROTECCIÓN",sold:true},{id:2,emo:"",name:"Jersey Oficial",price:650,tag:"EDICIÓN LTD",sold:true},{id:4,emo:"",name:"Gorra Táctica",price:280,tag:"ACCESORIOS",sold:true},{id:5,emo:"",name:"Playera Gladiador",price:320,tag:"ALGODÓN",sold:true}];
const EXTRAS=[{id:"e1",emo:"",name:"Sesión de fotos profesional",desc:"Fotógrafo con dron durante tu ruta",price:800},{id:"e2",emo:"",name:"Video de la aventura",desc:"Edición cinematográfica de tu recorrido",price:1200},{id:"e3",emo:"",name:"Comida en ruta",desc:"Picnic gourmet a media aventura",price:250},{id:"e4",emo:"",name:"Decoración para evento especial",desc:"Cumpleaños, pedida de mano, aniversarios",price:1500}];

const API = "https://gladiadores-backend.vercel.app";
// Se dispara de inmediato para que el loader ya tenga la respuesta lista
// cuando termine de cargar la página (ver window 'load' más abajo).
const chequeoMantenimiento = fetch(API+'/api/config/estado').then(r=>r.json()).catch(()=>({mantenimiento:false,reservasPausadas:true}));
let cart=[],bRoute=null,bStep=0,bHorario=null,bUnit=null,bPersonas=0,bExtras=[],bPayMode='anticipo',bPayMethod=null,bNota='';
// Ahora la reserva puede llevar VARIAS máquinas: 2 cuatrimotos + 1 Maverick,
// por ejemplo. bUnidades guarda cada renglón elegido y bDisp la
// disponibilidad real de la fecha (la manda el servidor, no se adivina).
let bUnidades=[],bDisp=null,bDispCargando=false;

function jump(id){document.getElementById(id).scrollIntoView({behavior:'smooth'});}
function toggleMobileMenu(){const h=document.getElementById('nav-hamburger');const d=document.getElementById('mob-drawer');const o=document.getElementById('mob-overlay');if(d.classList.contains('open')){closeMobileMenu();}else{h.classList.add('open');d.classList.add('open');o.classList.add('open');document.body.style.overflow='hidden';}}
function closeMobileMenu(){document.getElementById('nav-hamburger').classList.remove('open');document.getElementById('mob-drawer').classList.remove('open');document.getElementById('mob-overlay').classList.remove('open');document.body.style.overflow='';}
function mobileJump(id){closeMobileMenu();setTimeout(()=>jump(id),200);}

// SELECTOR DE MAPAS (Apple Maps / Google Maps / Waze)
function toggleMapPicker(e){e.stopPropagation();document.getElementById('map-picker').classList.toggle('open');}
document.addEventListener('click',(e)=>{const mp=document.getElementById('map-picker');if(mp&&mp.classList.contains('open')&&!e.target.closest('.map-picker-wrap'))mp.classList.remove('open');});

// Los colores de las fichas salen de la marca, no de la base: naranja manda,
// el verde gladiador va para lo familiar y tranquilo, y el morado se reserva
// para lo especial y lo más pesado (nocturnas, temporada, Día de Muertos).
const MARCA={fire:'255,122,0',gladio:'163,214,60',neon:'176,38,255'};
const TAGS_ESPECIALES=['ESPECIAL','TEMPORADA','NOCTURNA','DÍA DE MUERTOS','DIA DE MUERTOS'];
const TAGS_TRANQUILAS=['FAMILIAR','CULTURAL'];
function colorTag(r){const t=(r.tag||'').toUpperCase();
  if(TAGS_ESPECIALES.includes(t))return MARCA.neon;
  if(TAGS_TRANQUILAS.includes(t))return MARCA.gladio;
  return MARCA.fire;}
function colorDif(r){const d=(r.diff||'').toUpperCase();
  if(d==='FÁCIL'||d==='FACIL')return MARCA.gladio;
  if(d==='AVANZADA'||d==='EXTREMA')return MARCA.neon;
  return MARCA.fire;}
// El morado admite texto blanco; el naranja y el verde son claros y piden tinta oscura.
function tinta(rgb){return rgb===MARCA.neon?'#fff':'#0A0806';}

// El precio es por vehículo y depende de cuánta gente va: cada unidad trae
// su tabla de tarifas. Si el admin bloqueó asientos, se caen las tarifas
// que ya no caben.
/* La renta es por vehículo completo: la capacidad son las plazas. Los
   bloqueos por asiento (booked) eran del modelo viejo y ya no aplican. */
function capacidadDe(u){return u.seats;}
function tarifasDe(u){return (u.tarifas||[]).filter(t=>t.precio>0&&t.personas<=capacidadDe(u)).sort((a,b)=>a.personas-b.personas);}
function desdeDe(u){const t=tarifasDe(u);return t.length?t[0].precio:0;}
function precioDe(u,p){const t=tarifasDe(u).find(x=>x.personas===p);return t?t.precio:0;}
function unitsOf(r){return (r.units||[]).filter(u=>u.activo!==false&&tarifasDe(u).length);}
function renderRoutes(filter){const f=filter||'todas';lastFilter=f;document.getElementById('routes-grid').innerHTML=ROUTES.filter(r=>f==='todas'||r.exp===f).filter(r=>unitsOf(r).length).map(r=>{const us=unitsOf(r);const tot=us.reduce((s,u)=>s+u.seats,0),bk=us.reduce((s,u)=>s+u.booked.length,0),avl=tot-bk,pocos=avl>0&&avl<=Math.max(2,Math.round(tot*0.3)),minp=Math.min(...us.map(desdeDe));const imgStyle=r.img?`background-image:url(${r.img})`:`background:linear-gradient(135deg,var(--card) 0%,rgba(255,122,0,0.12) 50%,rgba(163,214,60,0.08) 100%)`;return `<div class="rc ${r.exp==='extrema'?'extrema':''}" data-a="openRouteFicha" data-p="${r.id}"><div class="rc-img" data-css="${imgStyle}"><div class="rc-img-ov"></div><div class="rc-tags-top"><span class="rc-tag" data-css="background:rgb(${colorTag(r)});color:${tinta(colorTag(r))}">${r.tag}</span><span class="rc-tag" data-css="background:rgb(${colorDif(r)});color:${tinta(colorDif(r))}">${r.diff}</span></div>${r.gal?`<div class="rc-galcount">${r.gal} fotos</div>`:''}<div class="rc-name">${r.name}</div></div><div class="rc-body"><div class="rc-desc">${r.desc}</div><div class="rc-tags">${r.terrain.map(t=>`<span class="rc-tr">${t}</span>`).join('')}</div><div class="rc-stats"><div class="rc-st"><div class="rc-st-lbl">DUR</div><div class="rc-sv">${r.dur}</div><div class="rc-sl">Duración</div></div><div class="rc-st"><div class="rc-st-lbl">DIST</div><div class="rc-sv">${r.dist}</div><div class="rc-sl">Distancia</div></div><div class="rc-st"><div class="rc-st-lbl">ASIENTOS</div><div class="rc-sv" data-css="color:${avl===0?'#FF5A5A':'var(--ink)'}">${avl}/${tot}</div><div class="rc-sl">Libres</div></div></div>${pocos?`<div class="rc-low"><span class="rc-low-dot"></span>Solo quedan ${avl} lugares</div>`:''}<div class="rc-foot"><div class="rc-price"><span class="from">desde</span>$${minp}<small>/unidad</small></div>${avl===0?`<div class="btn-full">LLENO</div>`:`<button class="btn-book" data-stop="1" data-a="openBooking" data-p="${r.id}">RESERVAR →</button>`}</div></div></div>`;}).join('');}
function filterExp(f,el){document.querySelectorAll('.exp-chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderRoutes(f);}
function renderUnits(){document.getElementById('units-grid').innerHTML=UNITS_FLEET.map(u=>`<div class="uc"><div class="uc-img"><img src="${u.img}" alt="${u.name} — vehículo 4x4 Can-Am de Gladiadores Off Road" loading="lazy" width="300" height="280"/></div><div class="uc-body"><div class="uc-cat">${u.cat}</div><div class="uc-name">${u.name}</div><div class="uc-specs"><div class="uc-spec"><b>${u.seats}</b><small>Capacidad</small></div><div class="uc-spec"><b>${u.qty}</b><small>Disponibles</small></div></div><span class="uc-tag">${u.tag}</span><br><span class="canam-badge">100% Can-Am</span></div></div>`).join('');}
function renderMerch(){document.getElementById('merch-grid').innerHTML=MERCH.map(m=>`<div class="mc${m.sold?' mc-sold':''}">${m.sold?'<div class="mc-ribbon">AGOTADO</div>':''}<div class="mc-emo">${m.emo}</div><div class="mc-tag">${m.tag}</div><div class="mc-name">${m.name}</div><div class="mc-price">$${m.price}</div>${m.sold?`<button class="mc-btn agotado" disabled>AGOTADO</button>`:`<button class="mc-btn" id="mb-${m.id}" data-a="addMerch" data-p="${m.id}">+ CARRITO</button>`}</div>`).join('');}
function addMerch(id){const m=MERCH.find(x=>x.id===id);if(!m||m.sold)return;addToCart({label:`${m.emo} ${m.name}`,price:m.price});const b=document.getElementById('mb-'+id);b.textContent='✓ AÑADIDO';b.classList.add('added');setTimeout(()=>{b.textContent='+ CARRITO';b.classList.remove('added');},1500);}

function addToCart(i){cart.push({...i,cid:Date.now()+Math.random()});updateBadge();}
function removeFromCart(c){cart=cart.filter(i=>i.cid!=c);updateBadge();renderCart();}
function updateBadge(){const b=document.getElementById('cart-badge');if(cart.length){b.style.display='flex';b.textContent=cart.length;}else b.style.display='none';}
function openCart(){renderCart();document.getElementById('cart-ovl').classList.add('open');}
function closeCart(){document.getElementById('cart-ovl').classList.remove('open');}
function renderCart(){const its=document.getElementById('cart-its'),ft=document.getElementById('cart-ft');if(!cart.length){its.innerHTML='<div class="cart-emp"><p>Tu carrito está vacío</p></div>';ft.innerHTML='';return;}its.innerHTML=cart.map(i=>`<div class="cart-it"><div><div class="cart-it-nm">${i.label}</div><div class="cart-it-pr">$${i.price}</div></div><button class="cart-rm" data-a="removeFromCart" data-p="${i.cid}">✕</button></div>`).join('');const t=cart.reduce((s,i)=>s+i.price,0);ft.innerHTML=`<div class="cart-tr"><span data-css="color:var(--muted)">Total</span><span class="cart-tv">$${t}</span></div><button class="btn-fw">PROCEDER AL PAGO</button>`;}

// FICHA DE RUTA: fotos y detalle antes de reservar. Se abre al tocar la
// tarjeta; el botón RESERVAR de la tarjeta sigue saltando directo a la
// reserva para quien ya decidió.
let rfRoute=null,rfIdx=0;
function rfPhotos(r){return (r.galeria&&r.galeria.length)?r.galeria:(r.img?[r.img]:[]);}
function openRouteFicha(id){rfRoute=ROUTES.find(r=>r.id===id);if(!rfRoute)return;rfIdx=0;renderRouteFicha();document.getElementById('route-overlay').classList.add('open');}
function closeRouteFicha(){document.getElementById('route-overlay').classList.remove('open');}
function rfNav(dir){const photos=rfPhotos(rfRoute);rfIdx=(rfIdx+dir+photos.length)%photos.length;renderRouteFicha();}
function rfGoto(i){rfIdx=i;renderRouteFicha();}
function rfReservar(){const id=rfRoute.id;closeRouteFicha();openBooking(id);}
function renderRouteFicha(){
  const r=rfRoute;const photos=rfPhotos(r);
  document.getElementById('rf-name').textContent=r.name;
  const us=unitsOf(r);const minp=us.length?Math.min(...us.map(desdeDe)):0;
  const viewer=photos.length?`<div class="rf-viewer"><img src="${photos[rfIdx]}" alt="${esc(r.name)} — foto ${rfIdx+1} de ${photos.length}">${photos.length>1?`<button class="rf-nav prev" data-a="rfNav" data-p="-1" aria-label="Foto anterior">‹</button><button class="rf-nav next" data-a="rfNav" data-p="1" aria-label="Foto siguiente">›</button><div class="rf-count">${rfIdx+1}/${photos.length}</div>`:''}</div>${photos.length>1?`<div class="rf-thumbs">${photos.map((p,i)=>`<img class="rf-thumb ${i===rfIdx?'sel':''}" src="${p}" data-a="rfGoto" data-p="${i}" alt="Miniatura ${i+1}">`).join('')}</div>`:''}`:`<div class="rf-viewer" data-css="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px">Sin fotos todavía</div>`;
  document.getElementById('rf-body').innerHTML=`${viewer}
    <div class="rf-info">
      <div class="rf-tags"><span class="rf-tag" data-css="background:rgb(${colorTag(r)});color:${tinta(colorTag(r))}">${esc(r.tag)}</span></div>
      <div class="rf-desc">${esc(r.desc)}</div>
      <div class="rf-stats">
        <div class="rf-st"><b>${esc(r.dur)}</b><small>DURACIÓN</small></div>
        <div class="rf-st"><b>${esc(r.diff)}</b><small>DIFICULTAD</small></div>
        <div class="rf-st"><b>${esc(r.dist)}</b><small>DISTANCIA</small></div>
      </div>
      <div class="rf-terrain">${(r.terrain||[]).map(t=>`<span class="rf-tr">${esc(t)}</span>`).join('')}</div>
      ${r.video?`<a class="rf-video" href="${esc(r.video)}" target="_blank" rel="noopener">▶ Ver video de la ruta</a>`:''}
      <div class="rf-price-block"><span class="rf-price-lbl">DESDE</span><span class="rf-price-val">$${minp}</span><span class="rf-price-unit">/unidad</span></div>
    </div>
    <div class="rf-footer" data-css="margin-top:6px">
      <button class="btn-back" data-css="flex:1" data-a="closeRouteFicha">← VOLVER A RUTAS</button>
      <button class="btn-next" data-css="flex:1" data-a="rfReservar">RESERVAR ESTA RUTA →</button>
    </div>`;
}

function openBooking(id){bRoute=ROUTES.find(r=>r.id===id);bStep=0;bNombre='';bEmail='';bWhatsapp='';bHorario=null;bUnit=null;bPersonas=0;bExtras=[];bPayMode='anticipo';bPayMethod=null;bFecha=null;bNota='';bPrivacidad=false;bUnidades=[];bDisp=null;bDispCargando=false;document.getElementById('mname').textContent=bRoute.name;renderStep();document.getElementById('book-overlay').classList.add('open');}
function closeBooking(){document.getElementById('book-overlay').classList.remove('open');}

function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function checkDatos(){const b=document.getElementById('btn-datos');if(b)b.disabled=!bNombre||!bEmail||!bWhatsapp||bWhatsapp.length!==10||!bPrivacidad;}
function tPrivacidad(){bPrivacidad=!bPrivacidad;checkDatos();const c=document.getElementById('chk-privacidad');if(c)c.classList.toggle('on',bPrivacidad);}
// PASOS: 1) fecha  2) unidades  3) datos  4) resumen.
// La fecha va primero a propósito: sin fecha no se puede saber qué
// máquinas quedan libres, y elegir una unidad que ya está apartada solo
// para descubrirlo al final es la peor experiencia posible.
function renderStep(){
  const L=['PASO 1 DE 4 · FECHA Y HORARIO','PASO 2 DE 4 · TUS UNIDADES','PASO 3 DE 4 · TUS DATOS','PASO 4 DE 4 · CONFIRMAR Y ENVIAR'];
  document.getElementById('mstep').textContent=L[bStep];
  const bd=document.getElementById('mbody');
  const bar=`<div class="step-bar">${[0,1,2,3].map(sx=>`<div class="step-seg" data-css="background:${sx<=bStep?'var(--fire)':'rgba(255,255,255,.1)'}"></div>`).join('')}</div>`;

  // ---------- PASO 1: FECHA Y HORARIO ----------
  if(bStep===0){
    const hoy=new Date().toISOString().split('T')[0];
    const diasOK=new Set(bRoute.diasActivos||[]);
    const hayDias=diasOK.size>0;
    const fechaValida=bFecha&&(!hayDias||diasOK.has(bFecha));
    bd.innerHTML=bar+`<span class="field-lbl">ELIGE LA FECHA</span>
      ${hayDias?renderBookCal():`<input type="date" id="input-fecha" class="date-in" min="${hoy}" value="${bFecha||''}" data-bindc="fecha">`}
      ${bFecha&&!fechaValida?'<p data-css="color:#FF5A5A;font-size:12px;margin-top:4px">Esa fecha no está disponible para esta ruta.</p>':''}
      <span class="field-lbl" data-css="margin-top:14px">HORARIO DE SALIDA</span>
      <div class="opt-row">${bRoute.horarios.map(h=>`<div class="opt ${bHorario===h?'sel':''}" data-a="setHorario" data-p="${h}">${h}</div>`).join('')}</div>
      <div class="btns-row" data-css="margin-top:8px"><button class="btn-next" ${(!fechaValida||!bHorario)?'disabled':''} data-a="goStep" data-p="1">VER UNIDADES DISPONIBLES →</button></div>`;
    return;
  }

  // ---------- PASO 2: UNIDADES (varias) ----------
  if(bStep===1){
    if(bDispCargando){
      bd.innerHTML=bar+'<p data-css="color:var(--muted);text-align:center;padding:26px 0">Consultando qué unidades quedan libres…</p>';
      return;
    }
    const fechaLegible=new Date(bFecha+'T00:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'});
    const total=totalUnidades();
    const usadasPorCat={};
    bUnidades.forEach(u=>{usadasPorCat[u.categoriaId]=(usadasPorCat[u.categoriaId]||0)+1;});

    const tarjetas=unitsOf(bRoute).map(u=>{
      const libresTot=libresDeCategoria(u.id);
      const libres=libresTot-(usadasPorCat[u.id]||0);
      const info=UNITS_FLEET.find(f=>f.uid===u.id);
      const img=info?info.img:'';
      const tarifas=tarifasDe(u);
      const agotada=libres<=0;
      return `<div class="unit-card ${agotada?'unit-agotada':''}">
        <div class="uc-top">
          ${img?`<img class="uc-img" src="${img}" alt="${esc(u.name)}">`:''}
          <div class="uc-info"><b>${esc(u.name)}</b><small>${esc(u.type)}</small>
            <span class="unit-libres ${agotada?'cero':''}">${agotada?'Sin disponibilidad esta fecha':(libres===1?'Queda 1 libre':'Quedan '+libres+' libres')}</span>
          </div>
        </div>
        ${agotada?'':`<div class="uc-tarifas">
          <div class="uc-pregunta">¿Cuántos van en esta unidad?</div>
          <div class="uc-opts">
            ${tarifas.map(t=>`<div class="opt uc-opt" data-a="addUnidad" data-p="${u.id}|${t.personas}"><b>${t.personas} ${t.personas===1?'persona':'personas'}</b><div class="uc-precio">$${t.precio}</div></div>`).join('')}
          </div></div>`}
      </div>`;
    }).join('');

    const listaSel=bUnidades.length?`<div class="sel-box">
      <div class="sel-tit">Tu selección · ${bUnidades.length} ${bUnidades.length===1?'unidad':'unidades'}</div>
      ${bUnidades.map((u,i)=>`<div class="sel-row"><div><b>${esc(u.nombre)}</b><small>${u.personas} ${u.personas===1?'persona':'personas'}</small></div><div class="sel-right"><span>$${u.precio}</span><button class="sel-x" data-a="delUnidad" data-p="${i}" aria-label="Quitar">✕</button></div></div>`).join('')}
      <div class="sel-tot"><span>Total</span><b>$${total}</b></div>
    </div>`:'<p class="sel-vacio">Toca una unidad y elige cuántos van. Puedes agregar varias.</p>';

    bd.innerHTML=bar+`<div class="fecha-chip">${fechaLegible} · ${esc(bHorario)}</div>
      <span class="field-lbl">UNIDADES DISPONIBLES</span>
      <div data-css="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">${tarjetas}</div>
      ${listaSel}
      <div class="btns-row"><button class="btn-back" data-a="goStep" data-p="0">← CAMBIAR FECHA</button><button class="btn-next" ${bUnidades.length?'':'disabled'} data-a="goStep" data-p="2">CONTINUAR →</button></div>`;
    return;
  }

  // ---------- PASO 3: DATOS ----------
  if(bStep===2){
    const total=totalUnidades();
    bd.innerHTML=bar+`<span class="field-lbl">TUS DATOS</span>
      <input type="text" id="input-nombre" class="date-in" placeholder="Nombre completo" value="${esc(bNombre)}" data-bind="nombre">
      <input type="email" id="input-email" class="date-in" placeholder="Correo electrónico" value="${esc(bEmail)}" data-bind="email">
      <input type="tel" id="input-whatsapp" class="date-in" placeholder="WhatsApp (10 dígitos)" maxlength="10" value="${esc(bWhatsapp)}" data-bind="whatsapp">
      <div data-css="background:rgba(163,214,60,0.07);border:1px solid rgba(163,214,60,0.28);border-radius:14px;padding:16px 18px;margin:16px 0 18px">
        <div data-css="font-weight:700;font-size:14px;color:var(--gladio);margin-bottom:4px">¿Necesitas algo distinto?</div>
        <div data-css="color:var(--muted);font-size:12.5px;line-height:1.6;margin-bottom:12px">Grupos grandes, cumpleaños, pedida de mano, empresas o cualquier detalle especial.</div>
        <textarea id="input-nota" class="date-in" rows="2" placeholder="Cuéntanos qué necesitas..." data-css="resize:vertical;min-height:56px;font-family:'Inter',sans-serif" data-bind="nota">${esc(bNota)}</textarea>
      </div>
      <div data-css="background:var(--card);border:1px solid rgba(255,122,0,0.2);border-radius:12px;padding:14px 16px;margin-bottom:16px;text-align:center"><div data-css="color:var(--muted);font-size:12px">Total (${bUnidades.length} ${bUnidades.length===1?'unidad':'unidades'})</div><div data-css="font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:900;color:var(--fire)">$${total}</div></div>
      <label data-css="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;cursor:pointer" data-prev="1" data-a="tPrivacidad"><div id="chk-privacidad" class="chk-box ${bPrivacidad?'on':''}">${bPrivacidad?'✓':''}</div><span data-css="font-size:12.5px;color:var(--muted);line-height:1.5">He leído y acepto el <a href="aviso-privacidad.html" target="_blank" data-stop="1" data-css="color:var(--fire)">Aviso de Privacidad</a> y el tratamiento de mis datos para gestionar esta reserva.</span></label>
      <div class="btns-row"><button class="btn-back" data-a="goStep" data-p="1">← ATRÁS</button><button class="btn-next" id="btn-datos" ${(!bNombre||!bEmail||!bWhatsapp||bWhatsapp.length!==10||!bPrivacidad)?'disabled':''} data-a="goStep" data-p="3">REVISAR SOLICITUD →</button></div>`;
    return;
  }

  // ---------- PASO 4: RESUMEN Y ENVÍO (pago por transferencia) ----------
  const total=totalUnidades();
  const anticipo=Math.round(total*0.25);
  const fechaLegible=new Date(bFecha+'T00:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  bd.innerHTML=bar+`<div class="summ-box">
      <div class="summ-row"><span data-css="color:var(--fire);font-weight:600">Cliente</span><span>${esc(bNombre)}</span></div>
      <div class="summ-row"><span data-css="color:var(--muted);font-size:12px">${esc(bEmail)} · ${esc(bWhatsapp)}</span></div>
      <div data-css="border-top:1px solid rgba(255,255,255,.1);margin:10px 0;padding-top:10px">
        <div class="summ-row"><span>${esc(bRoute.name)}</span><span></span></div>
        <div class="summ-row"><span data-css="color:var(--muted);font-size:12.5px">${fechaLegible} · ${esc(bHorario)}</span><span></span></div>
        ${bUnidades.map(u=>`<div class="summ-row"><span>${esc(u.nombre)} · ${u.personas} ${u.personas===1?'persona':'personas'}</span><span>$${u.precio}</span></div>`).join('')}
      </div>
      <div class="summ-tot"><span data-css="font-weight:600">Total</span><span class="summ-tot-p">$${total}</span></div>
    </div>
    <span class="field-lbl">¿CÓMO QUIERES PAGAR?</span>
    <div class="pay-split">
      <div class="pay-opt ${bPayMode==='anticipo'?'sel':''}" data-a="setPay" data-p="anticipo"><div class="pay-radio"></div><div class="po-name">Solo anticipo (25%)<div data-css="font-size:12px;color:var(--muted);font-weight:400">Resto el día de la ruta</div></div><div class="po-amt">$${anticipo}</div></div>
      <div class="pay-opt ${bPayMode==='completo'?'sel':''}" data-a="setPay" data-p="completo"><div class="pay-radio"></div><div class="po-name">Pago completo<div data-css="font-size:12px;color:var(--muted);font-weight:400">Listo, sin pagar nada más</div></div><div class="po-amt">$${total}</div></div>
    </div>
    <div class="transf-box">
      <div class="transf-tit">Pago por transferencia</div>
      <div class="transf-txt">Al enviar, apartamos tus unidades y se abre WhatsApp con tu solicitud. Ahí te pasamos los datos de la cuenta; nos mandas el comprobante y confirmamos tu lugar.</div>
    </div>
    <div class="btns-row" data-css="margin-top:6px"><button class="btn-back" data-a="goStep" data-p="2">← ATRÁS</button><button class="btn-next" data-a="enviarSolicitud">APARTAR Y ENVIAR →</button></div>`;
}

// Cuántas máquinas de esa categoría quedan libres en la fecha elegida.
// Si el servidor no contestó, se cae al conteo del catálogo para no
// bloquear la reserva por un problema de red.
function libresDeCategoria(catId){
  if(bDisp&&Array.isArray(bDisp.categorias)){
    const c=bDisp.categorias.find(x=>x.tipoId===catId);
    return c?c.libres:0;
  }
  const u=unitsOf(bRoute).find(x=>x.id===catId);
  return u?Math.max(0,u.seats?1:0):0;
}
function totalUnidades(){return bUnidades.reduce((s,u)=>s+u.precio,0);}
function addUnidad(arg){
  const [catId,personas]=String(arg).split('|');
  const u=unitsOf(bRoute).find(x=>x.id===catId);
  if(!u)return;
  const usadas=bUnidades.filter(x=>x.categoriaId===catId).length;
  if(usadas>=libresDeCategoria(catId))return;
  const t=tarifasDe(u).find(t=>t.personas===Number(personas));
  if(!t)return;
  bUnidades.push({categoriaId:catId,nombre:u.name,personas:Number(personas),precio:t.precio});
  renderStep();
}
function delUnidad(i){bUnidades.splice(Number(i),1);renderStep();}

// Pregunta al servidor qué queda libre en esa fecha antes de mostrar las
// unidades. Así el cliente solo ve lo que de verdad puede apartar.
async function cargarDisponibilidad(){
  bDispCargando=true;renderStep();
  try{
    const r=await fetch(`${API}/api/disponibilidad?fecha=${encodeURIComponent(bFecha)}&ruta=${bRoute.id}`);
    const d=await r.json();
    bDisp=(d&&d.ok)?d:null;
  }catch(e){bDisp=null;}
  bDispCargando=false;renderStep();
}

// Arma la solicitud como texto y la abre en WhatsApp. No toca la base de
// datos: mientras no haya pasarela de pago, apartar el lugar es una
// decisión manual del equipo.
// Guarda la reserva de verdad en el servidor (el precio lo calcula el
// servidor a partir de la tarifa real, nunca confía en lo que traiga el
// navegador) y solo entonces muestra el ticket y abre WhatsApp con el
// folio real. Si el servidor rechaza la reserva (unidad ya no libre,
// fecha ya no disponible), se avisa en vez de fingir que se envió.
async function enviarSolicitud(){
  const btn=document.querySelector('#mbody .btn-next');
  if(btn){btn.disabled=true;btn.textContent='Apartando…';}
  const datos={
    nombre:bNombre,email:bEmail,whatsapp:bWhatsapp,
    ruta:bRoute.name,rutaId:bRoute.id,
    horario:bHorario,fecha:bFecha,
    unidades:bUnidades.map(u=>({categoriaId:u.categoriaId,personas:u.personas})),
    modoPago:bPayMode,nota:bNota
  };
  try{
    const res=await fetch(API+'/api/reservas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
    const data=await res.json();
    if(!res.ok||!data.ok||!data.folio)throw new Error(data.error||'No se pudo apartar. Intenta de nuevo.');
    mostrarTicket(data);
  }catch(err){
    document.getElementById('mbody').innerHTML=`<div data-css="text-align:center;padding:20px;color:#ff6b6b"><div data-css="font-size:22px;margin-bottom:10px;line-height:1.4">⚠ ${esc(err.message||'Error de conexión')}</div><button class="btn-fw" data-css="background:#ff6b6b;margin-top:16px;" data-a="goStep" data-p="1">← ELEGIR OTRAS UNIDADES</button></div>`;
  }
}

// Ticket + aviso por WhatsApp. El mensaje va con TODO el detalle para que
// quien valida el pago sepa exactamente qué se apartó y por cuánto, sin
// tener que entrar al panel.
function mostrarTicket(data){
  const total=data.montoTotal;
  const anticipo=data.anticipo!=null?data.anticipo:Math.round(total*0.25);
  const aPagar=bPayMode==='completo'?total:anticipo;
  const fechaLegible=new Date(bFecha+'T00:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const unidades=(data.unidades&&data.unidades.length)?data.unidades:bUnidades;
  const listaTxt=unidades.map(u=>`${u.nombre} (${u.personas}p) $${u.precio}`).join(' + ');

  const qrTexto=['GLADIADORES OFF ROAD',data.folio,bRoute.name,fechaLegible+' · '+bHorario,listaTxt,'Total: $'+total].join('\n');
  let qrSvg='';
  try{const qr=qrcode(0,'M');qr.addData(qrTexto);qr.make();qrSvg=qr.createSvgTag({cellSize:5,margin:8});}catch(e){}

  const wa=['Hola! Aparté mi reserva en la página:','',
    'Folio: '+data.folio,
    'Cliente: '+bNombre,
    'WhatsApp: '+bWhatsapp,
    'Ruta: '+bRoute.name,
    'Fecha: '+fechaLegible,
    'Horario: '+bHorario,
    '','Unidades:'];
  unidades.forEach(u=>wa.push('  • '+u.nombre+' — '+u.personas+(u.personas===1?' persona':' personas')+' — $'+u.precio));
  wa.push('','Total: $'+total,
    bPayMode==='completo'?('Voy a transferir el pago completo: $'+total)
                         :('Voy a transferir el anticipo (25%): $'+anticipo+' · resto en la ruta: $'+(total-anticipo)));
  if(bNota.trim())wa.push('','Algo especial: '+bNota.trim());
  wa.push('','¿Me pasas los datos para la transferencia?');
  window.open('https://wa.me/527971001929?text='+encodeURIComponent(wa.join('\n')),'_blank');

  document.getElementById('mbody').innerHTML=`
  <div id="ticket-print" data-css="text-align:center;padding:8px 0">
    <div data-css="font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;color:var(--fire);margin-bottom:4px">UNIDADES APARTADAS</div>
    <p data-css="color:var(--muted);font-size:13px;margin-bottom:18px">Se abrió WhatsApp con tu solicitud. Mándanos el mensaje, te pasamos los datos de la cuenta y con tu comprobante confirmamos el lugar.</p>
    <div data-css="background:var(--card);border:1px solid rgba(255,122,0,0.3);border-radius:16px;padding:22px 18px;margin-bottom:16px">
      <img src="img/i1.png" alt="Gladiadores Off Road" width="44" height="44" data-css="margin-bottom:8px">
      <div data-css="color:var(--muted);font-size:11px;letter-spacing:1px;text-transform:uppercase">Folio</div>
      <div data-css="font-family:'Barlow Condensed',sans-serif;font-size:38px;font-weight:900;color:var(--fire);letter-spacing:1px;margin-bottom:14px">${esc(data.folio)}</div>
      <div data-css="display:flex;justify-content:center;margin-bottom:14px">${qrSvg}</div>
      <div data-css="text-align:left;border-top:1px solid rgba(255,255,255,.1);padding-top:14px;font-size:13.5px;color:var(--ink);line-height:1.9">
        <div><b data-css="color:var(--muted);font-weight:400">Ruta:</b> ${esc(bRoute.name)}</div>
        <div><b data-css="color:var(--muted);font-weight:400">Fecha:</b> ${fechaLegible} · ${esc(bHorario)}</div>
        ${unidades.map(u=>`<div><b data-css="color:var(--muted);font-weight:400">Unidad:</b> ${esc(u.nombre)} · ${u.personas} ${u.personas===1?'persona':'personas'}</div>`).join('')}
        <div data-css="border-top:1px solid rgba(255,255,255,.1);margin-top:6px;padding-top:6px"><b data-css="color:var(--muted);font-weight:400">Total:</b> <span data-css="color:var(--fire);font-weight:700">$${total}</span></div>
        <div><b data-css="color:var(--muted);font-weight:400">Por transferir ahora:</b> <span data-css="color:var(--fire);font-weight:700">$${aPagar}</span>${bPayMode==='anticipo'?` <span data-css="color:var(--muted)">· resto en la ruta $${total-anticipo}</span>`:''}</div>
      </div>
    </div>
    <p data-css="color:var(--muted);font-size:12.5px;margin-bottom:18px">Tu lugar queda apartado mientras validamos el pago. ¿No se abrió WhatsApp? Escríbenos al <b data-css="color:var(--ink)">797 100 1929</b></p>
    <div data-css="display:flex;gap:10px">
      <button class="btn-fw" data-css="background:transparent;border:1px solid rgba(255,255,255,.15);color:var(--ink)" data-a="printTicket">IMPRIMIR / GUARDAR</button>
      <button class="btn-fw" data-a="closeBooking">LISTO, CERRAR</button>
    </div>
  </div>`;
}
let bCalY,bCalM;
function initBookCal(){const d=new Date();bCalY=d.getFullYear();bCalM=d.getMonth();}
function bCalNav(dir){bCalM+=dir;if(bCalM>11){bCalM=0;bCalY++;}if(bCalM<0){bCalM=11;bCalY--;}renderStep();}
function pickDay(iso){bFecha=iso;renderStep();}
function renderBookCal(){
  if(bCalY==null)initBookCal();
  const meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const hoy=new Date().toISOString().slice(0,10);
  const diasOK=new Set(bRoute.diasActivos||[]);
  const first=new Date(bCalY,bCalM,1);
  const startDow=(first.getDay()+6)%7;
  const dim=new Date(bCalY,bCalM+1,0).getDate();
  let h=`<div data-css="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><button class="opt" data-a="bCalNav" data-p="-1" data-css="padding:6px 12px">←</button><b data-css="color:var(--ink);font-size:14px">${meses[bCalM]} ${bCalY}</b><button class="opt" data-a="bCalNav" data-p="1" data-css="padding:6px 12px">→</button></div>`;
  h+='<div data-css="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:360px">';
  ['L','M','X','J','V','S','D'].forEach(d=>{h+=`<div data-css="text-align:center;font-size:11px;color:var(--muted);font-weight:600;padding:4px 0">${d}</div>`;});
  for(let e=0;e<startDow;e++) h+='<div></div>';
  for(let d=1;d<=dim;d++){
    const iso=`${bCalY}-${String(bCalM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const past=iso<hoy;
    const on=diasOK.has(iso);
    const sel=bFecha===iso;
    let cls='';let style='text-align:center;padding:8px 0;border-radius:8px;font-size:13px;cursor:pointer;border:1px solid transparent;';
    if(past){style+='opacity:0.25;pointer-events:none;color:var(--muted);';}
    else if(sel){style+='background:var(--fire);color:#fff;font-weight:700;';}
    else if(on){style+='background:rgba(76,175,80,0.12);border-color:rgba(76,175,80,0.35);color:#4caf50;font-weight:600;';}
    else{style+='color:var(--muted);opacity:0.4;pointer-events:none;';}
    h+=`<div data-css="${style}" data-a="pickDay" data-p="${iso}">${d}</div>`;
  }
  h+='</div>';
  return h;
}
function tExtra(id){const i=bExtras.indexOf(id);if(i>=0)bExtras.splice(i,1);else bExtras.push(id);renderStep();}

// CARRUSEL
let cur=0;const slides=document.querySelectorAll('.slide'),total=slides.length,dw=document.getElementById('dots');
slides.forEach((_,i)=>{const d=document.createElement('div');d.className='dot'+(i===0?' active':'');d.onclick=()=>goSlide(i);dw.appendChild(d);});
const dots=document.querySelectorAll('.dot');let timer=setInterval(()=>goSlide(cur+1),6000);
function goSlide(i){slides[cur].classList.remove('active');dots[cur].classList.remove('active');cur=(i+total)%total;slides[cur].classList.add('active');dots[cur].classList.add('active');const bg=slides[cur].querySelector('.slide-bg');bg.style.animation='none';void bg.offsetWidth;bg.style.animation='';clearInterval(timer);timer=setInterval(()=>goSlide(cur+1),6000);}
function nextSlide(){goSlide(cur+1);}function prevSlide(){goSlide(cur-1);}

// REG
let regPrivacidad=false;
function openReg(){regPrivacidad=false;const c=document.getElementById('chk-reg-privacidad');if(c)c.classList.remove('on');document.getElementById('reg-overlay').classList.add('open');}
function closeReg(){document.getElementById('reg-overlay').classList.remove('open');localStorage.setItem('reg_done','1');}
function tRegPrivacidad(){regPrivacidad=!regPrivacidad;document.getElementById('chk-reg-privacidad').classList.toggle('on',regPrivacidad);}
function submitReg(){const n=document.getElementById('r-nombre').value,e=document.getElementById('r-email').value;if(!n||!e){alert('Completa nombre y correo');return;}if(!regPrivacidad){alert('Acepta el Aviso de Privacidad para continuar');return;}document.getElementById('reg-form-wrap').style.display='none';document.getElementById('reg-success').classList.add('show');localStorage.setItem('reg_done','1');}

// CHATBOT
function toggleChat(){document.getElementById('chat-win').classList.toggle('open');document.getElementById('chat-input').focus();}

// Agente real (Claude) del lado del backend. El historial se manda completo
// en cada mensaje porque el servidor no guarda sesión de chat.
let chatHistorial=[];
let chatEnviando=false;

function pintarMsg(texto,esUsuario){
  const body=document.getElementById('chat-body');
  const div=document.createElement('div');
  div.className='chat-msg'+(esUsuario?' user':'');
  div.textContent=texto;
  body.appendChild(div);
  body.scrollTop=body.scrollHeight;
}

function mostrarEscribiendo(){
  const body=document.getElementById('chat-body');
  const t=document.createElement('div');
  t.className='chat-typing';t.id='chat-typing-ind';
  t.innerHTML='<span></span><span></span><span></span>';
  body.appendChild(t);
  body.scrollTop=body.scrollHeight;
}
function quitarEscribiendo(){document.getElementById('chat-typing-ind')?.remove();}

function chatSugerido(texto){
  document.getElementById('chat-input').value=texto;
  enviarChat();
}

async function enviarChat(){
  if(chatEnviando)return;
  const input=document.getElementById('chat-input');
  const texto=input.value.trim();
  if(!texto)return;

  document.getElementById('chat-quick').style.display='none';
  pintarMsg(texto,true);
  chatHistorial.push({role:'user',content:texto});
  input.value='';
  chatEnviando=true;
  mostrarEscribiendo();

  try{
    const res=await fetch(`${API}/api/chatbot/mensaje`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({conversacion:chatHistorial})
    });
    const data=await res.json();
    quitarEscribiendo();
    const respuesta=data.respuesta||'Tuve un problema. Mejor escríbeme por WhatsApp.';
    pintarMsg(respuesta,false);
    chatHistorial.push({role:'assistant',content:respuesta});
  }catch(err){
    quitarEscribiendo();
    pintarMsg('No pude conectar. Escríbeme directo por WhatsApp para ayudarte mejor.',false);
  }finally{
    chatEnviando=false;
  }
}

function goWhatsApp(){window.open('https://wa.me/527971001929?text=Hola!%20Vengo%20de%20la%20p%C3%A1gina%20y%20quiero%20info%20sobre%20las%20rutas','_blank');}

// REVEAL on scroll
const obs=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.12});
document.querySelectorAll('.reveal,.tread-divider').forEach(el=>obs.observe(el));

// NAV bg
window.addEventListener('scroll',()=>{document.getElementById('nav').style.background=window.scrollY>60?'rgba(8,10,7,0.92)':'rgba(8,10,7,0.55)';});

// INIT
window.addEventListener('load',()=>{
  chequeoMantenimiento.then(d=>{
    const l=document.getElementById('loader');
    if(!l)return;
    if(d && d.mantenimiento){
      l.innerHTML='<div class="loader-helmet"><img src="img/i1.png" alt="Gladiadores Off Road" width="110" height="110"/></div><div class="loader-txt">EN MANTENIMIENTO</div><div class="mant-msg">Estamos afinando la aventura para que la vivas mejor. Volvemos muy pronto.</div><a class="mant-wsp" href="https://wa.me/527971001929" target="_blank" rel="noopener">¿Dudas? Escríbenos por WhatsApp</a>';
      document.title='En mantenimiento · Gladiadores Off Road';
      return;
    }
    setTimeout(()=>l.classList.add('hide'),1400);
  });
});
(function(){if(localStorage.getItem('reg_done'))return;var fired=false;window.addEventListener('scroll',function(){if(fired)return;var pct=window.scrollY/(document.body.scrollHeight-window.innerHeight);if(pct>0.35){fired=true;openReg();}});})();
renderUnits();renderMerch();
// Los precios vivos mandan: pintamos las rutas hasta que llega el catálogo del admin,
// así nunca se alcanza a ver el precio del respaldo. Si falla, se usa el respaldo.
document.getElementById('routes-grid').innerHTML='<p data-css="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0">Cargando rutas…</p>';
fetch('https://gladiadores-backend.vercel.app/api/catalogo',{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('HTTP '+r.status)))
  .then(d=>{if(d&&d.ok&&Array.isArray(d.rutas)&&d.rutas.length)ROUTES=d.rutas;})
  .catch(e=>console.warn('Catálogo remoto no disponible, usando respaldo:',e.message))
  .finally(()=>renderRoutes(lastFilter));

// ── DUST PARTICLE SYSTEM ──
// El polvo de fondo reacciona a qué tan rápido se scrollea la página, como
// si scrollear fuera "manejar": entre más rápido, más se levanta el polvo
// y más se acelera hacia arriba; en reposo vuelve a flotar tranquilo.
(function(){
  const c=document.getElementById('dust-canvas');if(!c)return;
  const ctx=c.getContext('2d');
  let W,H;
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  const particles=[];
  const COUNT=60;
  for(let i=0;i<COUNT;i++){
    particles.push({
      x:Math.random()*W,y:Math.random()*H,
      r:Math.random()*2.5+0.5,
      dx:(Math.random()-0.5)*0.4,
      dy:Math.random()*0.3+0.1,
      o:Math.random()*0.5+0.1,
      color:Math.random()>0.7?'rgba(163,214,60,':'rgba(255,122,0,'
    });
  }
  let kick=0,lastY=window.scrollY,lastT=performance.now();
  window.addEventListener('scroll',()=>{
    const now=performance.now();
    const dt=Math.max(16,now-lastT);
    const v=Math.abs(window.scrollY-lastY)/dt;
    kick=Math.min(2.2,kick+v*10);
    lastY=window.scrollY;lastT=now;
  },{passive:true});
  function draw(){
    ctx.clearRect(0,0,W,H);
    kick*=0.94;
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+Math.min(1,p.o*(1+kick*0.6))+')';
      ctx.fill();
      p.x+=p.dx*(1+kick);
      p.y+=p.dy*(1+kick*1.8);
      if(p.y>H+10){p.y=-10;p.x=Math.random()*W;}
      if(p.x<-10)p.x=W+10;
      if(p.x>W+10)p.x=-10;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── SCROLL PROGRESS BAR ──
window.addEventListener('scroll',function(){
  const h=document.documentElement;
  const pct=h.scrollTop/(h.scrollHeight-h.clientHeight)*100;
  document.getElementById('scroll-progress').style.width=pct+'%';
});

// ── ENHANCED REVEAL (stagger children) ──
const revealObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      const children=e.target.querySelectorAll('.ig-card,.rc,.uc,.mc,.rank-c,.gal-item,.chigna-item');
      children.forEach((ch,i)=>{
        // Entrada tipo "brinco de terracería": cada tarjeta cae con una
        // leve inclinación alterna y se asienta derecha, en vez de un
        // deslizamiento uniforme sin carácter.
        const tilt=i%2===0?-2.5:2.5;
        ch.style.opacity='0';
        ch.style.transform=`translateY(34px) rotate(${tilt}deg)`;
        ch.style.transition='opacity .6s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.34,1.4,.4,1)';
        ch.style.transitionDelay=(i*0.08)+'s';
        setTimeout(()=>{ch.style.opacity='1';ch.style.transform='none';},50);
      });
    }
  });
},{threshold:.08});
document.querySelectorAll('.reveal,.ig-feed,.routes-grid,.units-grid,.merch-grid,.gal-grid,.ranks,.chigna-list').forEach(el=>revealObs.observe(el));

// ── PARALLAX ON SCROLL ──
let ticking=false;
window.addEventListener('scroll',function(){
  if(!ticking){
    requestAnimationFrame(()=>{
      const sy=window.scrollY;
      document.querySelectorAll('.slide-bg').forEach(bg=>{
        bg.style.transform='translateY('+sy*0.15+'px) scale(1.08)';
      });
      const chImg=document.querySelector('.chigna-img');
      if(chImg){
        const r=chImg.getBoundingClientRect();
        if(r.top<window.innerHeight&&r.bottom>0){
          chImg.style.backgroundPositionY=(50+(r.top/window.innerHeight-0.5)*20)+'%';
        }
      }
      ticking=false;
    });
    ticking=true;
  }
});

// ── COUNTER ANIMATION ──
function animateCounters(){
  document.querySelectorAll('.ig-card-stat b').forEach(el=>{
    const target=parseInt(el.textContent);
    if(el.dataset.animated)return;
    el.dataset.animated='1';
    let current=0;
    const step=Math.ceil(target/30);
    const timer=setInterval(()=>{
      current+=step;
      if(current>=target){current=target;clearInterval(timer);}
      el.textContent=current;
    },30);
  });
}
const counterObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting)animateCounters();});
},{threshold:.3});
const igSection=document.getElementById('ugc');
if(igSection)counterObs.observe(igSection);

// ── NAV HIDE/SHOW ON SCROLL ──
let lastScroll=0;
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('nav');
  const sy=window.scrollY;
  if(sy>lastScroll&&sy>300){nav.style.transform='translateY(-100%)';nav.style.transition='transform .3s';}
  else{nav.style.transform='none';}
  lastScroll=sy;
});


// ── DESPACHADOR DE EVENTOS ──
// El sitio no tiene ni un handler inline (onclick="...") para que el CSP
// pueda prohibir todo script embebido en HTML. Los botones declaran
// data-a="acción" (+ data-p="argumento") y este único listener los atiende.
// ACTS es la lista blanca: si una acción no está aquí, el clic no hace nada.
// Un elemento con data-stop y sin data-a es zona muerta: absorbe el clic
// para que no dispare la acción de su contenedor (reemplaza al viejo
// event.stopPropagation() inline).
const ACTS={addUnidad,delUnidad,jump,mobileJump,closeMobileMenu,toggleMobileMenu,closeReg,openReg,submitReg,closeBooking,openBooking,toggleChat,enviarChat,chatSugerido,goWhatsApp,closeRouteFicha,openRouteFicha,rfNav,rfGoto,rfReservar,closeCart,openCart,removeFromCart,addMerch,prevSlide,nextSlide,filterExp,pickDay,bCalNav,enviarSolicitud,tPrivacidad,tRegPrivacidad,
 goStep:n=>{const antes=bStep;bStep=n;if(n===1&&(antes!==1)){cargarDisponibilidad();return;}renderStep();},
 setPay:m=>{bPayMode=m;renderStep();},
 setHorario:h=>{bHorario=h;renderStep();},
 goTop:()=>scrollTo(0,0),
 galScroll:d=>{const tr=document.getElementById('gal-track');if(!tr)return;const s=tr.querySelector('.gal-slide');const w=s?s.getBoundingClientRect().width+14:320;tr.scrollBy({left:d*w,behavior:'smooth'});},
 printTicket:()=>window.print(),
 openIG:()=>window.open('https://www.instagram.com/gladiadores.off.road','_blank'),
 mapPicker:(el,e)=>toggleMapPicker(e)};

// Bindings de inputs: 'input' para texto (tecla por tecla), 'change' para
// la fecha (renderStep() re-crea el input y tirará el foco si fuera por tecla).
const BINDS_IN={
 nombre:v=>{bNombre=v;checkDatos();},
 email:v=>{bEmail=v;checkDatos();},
 whatsapp:(v,el)=>{bWhatsapp=v.replace(/\D/g,'');el.value=bWhatsapp;checkDatos();},
 nota:v=>{bNota=v;}};
const BINDS_CH={fecha:v=>{bFecha=v;renderStep();}};

const convArg=s=>s!==''&&!isNaN(s)?+s:s;
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-a],[data-stop]');
  if(!t)return;
  if(t.dataset.prev!==undefined)e.preventDefault();
  const fn=t.dataset.a&&ACTS[t.dataset.a];
  if(!fn)return;
  const args=t.dataset.p!==undefined?t.dataset.p.split('|').map(convArg):[];
  fn(...args,t,e);
});
document.addEventListener('input',e=>{const b=e.target.dataset?e.target.dataset.bind:null;if(b&&BINDS_IN[b])BINDS_IN[b](e.target.value,e.target);});
document.addEventListener('change',e=>{const b=e.target.dataset?e.target.dataset.bindc:null;if(b&&BINDS_CH[b])BINDS_CH[b](e.target.value,e.target);});
