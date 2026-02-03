
import React, { useState, useEffect } from 'react'; 
import { 
  Heart, Camera, Music, Trash2, Download, Eye, Edit3, 
  Clock, Gift, Disc, Loader2, Plus, X, HelpCircle, Quote, CheckCircle2, Sparkles, Image as ImageIcon,
  MessageCircle, Link as LinkIcon, Calendar, Star, ExternalLink, ChevronDown, Send, BadgePercent
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 

// --- CONSTANTES --- 
const APP_ID = 'san-valentin-2025-ultra-deluxe-v3'; 
const DB_NAME = 'SanValentinDB'; 
const DB_VERSION = 1; 
const STORE_IMAGES = 'images'; 
const WHATSAPP_NUMBER = '51922387916'; // Configura tu número real aquí

// --- PRESETS DE FRASES ---
const PRESET_PHRASES = [ 
  "Eres el amor de mi vida y mi mejor aventura ❤️", 
  "No te cambiaría por nada ni por nadie 🔐", 
  "Mi corazón late más fuerte cuando estoy contigo 💓", 
  "Juntos es mi lugar favorito en el mundo 🌍", 
  "Gracias por enseñarme lo que es el amor verdadero ✨" 
]; 

const PRESET_MUSIC = [ 
  "Nuestra canción, nuestro momento 🎶", 
  "Esta melodía me recuerda a ti ❤️", 
  "El ritmo de nuestro amor 💓",
  "La banda sonora de nuestras vidas ✨"
]; 

const PRESET_PROPOSALS = [
  "¿Quieres ser mi San Valentín para siempre? 🌹",
  "¿Me harías el honor de seguir siendo mi compañer@ de vida? ✨",
  "¿Quieres que nuestro amor sea infinito? ♾️",
  "¿Te gustaría que escribiéramos más capítulos juntos? 📖"
];

// --- TYPES ---
interface Moment {
  id: number;
  title: string;
  description: string;
  imageId: string | null;
}

interface Coupon {
  id: number;
  text: string;
}

interface AppData {
  targetName: string;
  senderName: string;
  shortPhrase: string;
  proposalQuestion: string;
  musicPhrase: string;
  mainMessage: string;
  dateMet: string;
  youtubeLink: string;
  coupons: Coupon[];
  moments: Moment[];
  gallery: string[];
  reasons: string[];
  promises: string[];
}

// --- UTILIDADES INDEXEDDB --- 
const initDB = () => { 
  return new Promise<IDBDatabase>((resolve, reject) => { 
    const request = indexedDB.open(DB_NAME, DB_VERSION); 
    request.onupgradeneeded = (event: any) => { 
      const db = event.target.result; 
      if (!db.objectStoreNames.contains(STORE_IMAGES)) { 
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id' }); 
      } 
    }; 
    request.onsuccess = (event: any) => resolve(event.target.result); 
    request.onerror = (event: any) => reject(request.error); 
  }); 
}; 

const saveImageToDB = async (id: string, blob: Blob) => { 
  const db = await initDB(); 
  const tx = db.transaction(STORE_IMAGES, 'readwrite'); 
  const store = tx.objectStore(STORE_IMAGES); 
  return new Promise((resolve, reject) => {
    const request = store.put({ id, blob });
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}; 

const getImageFromDB = async (id: string) => { 
  const db = await initDB(); 
  const tx = db.transaction(STORE_IMAGES, 'readonly'); 
  const store = tx.objectStore(STORE_IMAGES); 
  return new Promise<Blob | null>((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error);
  });
}; 

const compressImage = (file: File): Promise<Blob> => { 
  return new Promise((resolve) => { 
    const reader = new FileReader(); 
    reader.readAsDataURL(file); 
    reader.onload = (event: any) => { 
      const img = new Image(); 
      img.src = event.target.result; 
      img.onload = () => { 
        const canvas = document.createElement('canvas'); 
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width; 
        canvas.width = MAX_WIDTH; 
        canvas.height = img.height * scaleSize; 
        const ctx = canvas.getContext('2d')!; 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
        canvas.toBlob((blob) => { resolve(blob!); }, 'image/jpeg', 0.75); 
      }; 
    }; 
  }); 
}; 

// --- DATA INITIAL --- 
const INITIAL_DATA: AppData = { 
  targetName: "Mi Vida", 
  senderName: "Tu Amor 💖", 
  shortPhrase: PRESET_PHRASES[0], 
  proposalQuestion: PRESET_PROPOSALS[0], 
  musicPhrase: PRESET_MUSIC[0], 
  mainMessage: "Desde que entraste en mi vida, todo tiene color. Eres mi primer pensamiento al despertar y el último al dormir. No hay distancia ni tiempo que pueda con lo que siento por ti. Prometo amarte, cuidarte y hacerte feliz cada día de mi vida. ❤️✨🥺", 
  dateMet: new Date().toISOString().split('T')[0], 
  youtubeLink: "", 
  coupons: [ 
    { id: 1, text: "Vale por una cena romántica 🕯️🍷" }, 
    { id: 2, text: "Vale por un beso de película 🎬💋" },
    { id: 3, text: "Vale por un masaje relajante 💆‍♂️💆‍♀️" },
    { id: 4, text: "Vale por un 'Sí' a todo por un día 👑" }
  ], 
  moments: [ 
    { id: 1, title: "El día que nos conocimos 💘", description: "El comienzo de nuestra hermosa historia.", imageId: null },
    { id: 2, title: "Nuestro primer beso 💋", description: "Un instante mágico que nunca olvidaré.", imageId: null },
    { id: 3, title: "El viaje en nuestra historia ✈️", description: "Aquel viaje que marcó un antes y un después en nosotros.", imageId: null }
  ], 
  gallery: [],
  reasons: ["Tu mirada que me derrite 🥰", "Tus abrazos que me reinician 🫂", "Esa sonrisa que ilumina mi día ✨"],
  promises: ["Amarte sin condiciones 💍", "Estar contigo en las buenas y malas 🤝", "Hacerte feliz cada día de mi vida ❤️"]
}; 

// --- COMPONENTES AUXILIARES ---
const FloatingHearts = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: "110%", opacity: 0, x: `${Math.random() * 100}%` }}
        animate={{ y: "-10%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
        className="absolute text-rose-500/20 text-4xl"
      >❤️</motion.div>
    ))}
  </div>
);

const Typewriter = ({ text }: { text: string }) => { 
  const [currentText, setCurrentText] = useState(""); 
  const [index, setIndex] = useState(0); 

  useEffect(() => { 
    if (index < text.length) { 
      const timer = setTimeout(() => { 
        setCurrentText(prev => prev + text[index]); 
        setIndex(prev => prev + 1); 
      }, 35); 
      return () => clearTimeout(timer); 
    } 
  }, [index, text]); 

  return <span>{currentText}</span>; 
}; 

export default function App() { 
  const [data, setData] = useState<AppData>(INITIAL_DATA); 
  const [view, setView] = useState<'editor' | 'preview'>('editor'); 
  const [isUploading, setIsUploading] = useState(false); 
  const [redeemedCoupons, setRedeemedCoupons] = useState<number[]>([]); 
  const [isProposalAccepted, setIsProposalAccepted] = useState(false); 
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null); 
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({}); 
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionStep, setActionStep] = useState<'select' | 'notice'>('select');

  // ELIMINADA TODA PERSISTENCIA: El estado es 100% volátil, se borra al refrescar
  useEffect(() => { 
    initDB(); 
  }, []); 

  const saveData = (newData: AppData) => { 
    setData(newData); 
  }; 

  const handleFileUpload = async (file: File) => { 
    setIsUploading(true); 
    try { 
      const blob = await compressImage(file); 
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 5); 
      await saveImageToDB(id, blob); 
      setPreviewUrls(prev => ({ ...prev, [id]: URL.createObjectURL(blob) })); 
      return id; 
    } catch (e) { return null; } finally { setIsUploading(false); } 
  }; 

  const calculateDays = (date: string) => { 
    if (!date) return 0;
    const start = new Date(date);
    if (isNaN(start.getTime())) return 0;
    const now = new Date();
    start.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diff = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }; 

  const triggerConfetti = (id: string) => { 
    const el = document.getElementById(id); if (!el) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.innerHTML = ['❤️', '💖', '✨', '💝', '🌸'][Math.floor(Math.random() * 5)];
      p.style.position = 'fixed'; p.style.left = r.left + r.width/2 + 'px'; p.style.top = r.top + r.height/2 + 'px';
      p.style.zIndex = '9999'; p.style.transition = 'all 1.2s cubic-bezier(0.19, 1, 0.22, 1)';
      document.body.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 200 + 100;
      const tx = Math.cos(angle) * velocity; const ty = Math.sin(angle) * velocity - 150;
      requestAnimationFrame(() => { p.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random()*720}deg) scale(0)`; p.style.opacity = '0'; });
      setTimeout(() => p.remove(), 1200);
    }
  };

  const redeemCoupon = (id: number) => { 
    setIsRedeeming(id); 
    setTimeout(() => { 
      triggerConfetti(`coupon-btn-${id}`);
      setRedeemedCoupons(prev => [...prev, id]); 
      setIsRedeeming(null); 
    }, 1000); 
  }; 

  const FieldWithPresets = ({ label, value, onChange, presets, placeholder }: { label: string, value: string, onChange: (v: string) => void, presets: string[], placeholder: string }) => {
    const [showPresets, setShowPresets] = useState(false);
    return (
      <div className="space-y-2 relative">
        <label className="text-xs font-bold text-slate-400 uppercase ml-2">{label}</label>
        <div className="flex gap-2">
          <input value={value} onChange={e => onChange(e.target.value)} className="bg-rose-50 p-4 rounded-2xl flex-1 outline-none border-none focus:ring-2 focus:ring-rose-200" placeholder={placeholder} />
          <button onClick={() => setShowPresets(!showPresets)} className={`p-4 rounded-2xl transition-colors ${showPresets ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-500'}`}><ChevronDown size={20}/></button>
        </div>
        <AnimatePresence>
          {showPresets && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border border-rose-100 rounded-2xl shadow-xl z-10">
              <div className="p-2 space-y-1">
                {presets.map((p, i) => (
                  <button key={i} onClick={() => { onChange(p); setShowPresets(false); }} className="w-full text-left p-3 hover:bg-rose-50 rounded-xl text-sm font-medium text-slate-600 transition-colors">{p}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return ( 
    <div className="min-h-screen bg-rose-50 font-sans text-slate-800 pb-20 overflow-x-hidden"> 
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-3 sm:px-4 py-3 flex items-center justify-between max-w-5xl mx-auto md:mt-4 md:rounded-2xl shadow-sm"> 
        <div className="flex items-center gap-1 sm:gap-2"> 
          <Heart className="text-rose-500 fill-current" size={22} /> 
          <span className="font-black text-rose-600 tracking-tighter text-base sm:text-xl">San Valentín Web</span> 
        </div> 
        <button onClick={() => setView(view === 'editor' ? 'preview' : 'editor')} className="bg-rose-500 text-white px-3 sm:px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-rose-600 transition-all flex items-center gap-2 active:scale-95 text-xs sm:text-base"> 
          {view === 'editor' ? <><Eye size={16}/> Ver</> : <><Edit3 size={16}/> Editar</>} 
        </button> 
      </nav> 

      {view === 'editor' ? ( 
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8"> 
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Personaliza tu Regalo 🎁</h1>
            <p className="text-slate-500 font-medium text-xs sm:text-base">Completa cada sección para crear algo mágico</p>
          </div>

          <section className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-rose-100 space-y-6">
            <h3 className="font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border-b border-rose-50 pb-4"><Star size={14}/> Datos Principales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Para:</label>
                <input value={data.targetName} onChange={e => saveData({...data, targetName: e.target.value})} className="bg-rose-50 p-4 rounded-2xl w-full outline-none border-none focus:ring-2 focus:ring-rose-200" placeholder="¿Para quién es?" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">De parte de:</label>
                <input value={data.senderName} onChange={e => saveData({...data, senderName: e.target.value})} className="bg-rose-50 p-4 rounded-2xl w-full outline-none border-none focus:ring-2 focus:ring-rose-200" placeholder="¿De parte de quién?" />
              </div>
            </div>
            
            <FieldWithPresets label="Frase Corta Destacada:" value={data.shortPhrase} onChange={(v) => saveData({...data, shortPhrase: v})} presets={PRESET_PHRASES} placeholder="Una frase que te guste..." />

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Nuestra Fecha Especial:</label>
              <input type="date" value={data.dateMet} onChange={e => saveData({...data, dateMet: e.target.value})} className="bg-rose-50 p-4 rounded-2xl w-full outline-none border-none focus:ring-2 focus:ring-rose-200" />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Tu Carta:</label>
              <textarea value={data.mainMessage} onChange={e => saveData({...data, mainMessage: e.target.value})} className="bg-rose-50 p-4 rounded-2xl w-full h-40 resize-none outline-none border-none focus:ring-2 focus:ring-rose-200 leading-relaxed" placeholder="Escribe tu carta de amor aquí..." />
            </div>
          </section>

          <section className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-rose-100 space-y-6">
            <h3 className="font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border-b border-rose-50 pb-4"><Clock size={16}/> Nuestra Historia</h3>
            <div className="space-y-4">
              {data.moments.map((m, idx) => (
                <div key={idx} className="p-4 sm:p-5 bg-rose-50/50 rounded-3xl border border-rose-100 flex flex-col sm:flex-row gap-4 relative group">
                   <button onClick={() => saveData({...data, moments: data.moments.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-rose-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                   <label className="w-full sm:w-24 h-40 sm:h-24 bg-white rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden shrink-0 border border-rose-100 shadow-sm hover:border-rose-300 transition-colors">
                      {m.imageId && previewUrls[m.imageId] ? <img src={previewUrls[m.imageId]} className="w-full h-full object-cover" /> : <Camera size={24} className="text-rose-200" />}
                      <input type="file" hidden accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (file) {
                          const id = await handleFileUpload(file); if (id) {
                            const nm = [...data.moments]; nm[idx].imageId = id; saveData({...data, moments: nm});
                          }
                        }
                      }} disabled={isUploading}/>
                   </label>
                   <div className="flex-1 space-y-2">
                      <input value={m.title} onChange={e => { const nm = [...data.moments]; nm[idx].title = e.target.value; saveData({...data, moments: nm}); }} className="w-full bg-white rounded-xl p-2 font-bold text-sm outline-none shadow-sm" placeholder="Título" />
                      <textarea value={m.description} onChange={e => { const nm = [...data.moments]; nm[idx].description = e.target.value; saveData({...data, moments: nm}); }} className="w-full bg-white rounded-xl p-2 text-xs h-20 resize-none outline-none shadow-sm" placeholder="Descripción..." />
                   </div>
                </div>
              ))}
              <button onClick={() => saveData({...data, moments: [...data.moments, { id: Date.now(), title: "", description: "", imageId: null }]})} className="w-full py-4 border-2 border-dashed border-rose-200 rounded-2xl text-rose-400 font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"><Plus size={18}/> Añadir Momento</button>
            </div>
          </section>

          <section className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-rose-100 space-y-6">
            <h3 className="font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border-b border-rose-50 pb-4"><ImageIcon size={16}/> Galería de Recuerdos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {data.gallery.map(id => (
                <div key={id} className="relative aspect-square bg-rose-50 rounded-2xl overflow-hidden group shadow-sm">
                  <img src={previewUrls[id]} className="w-full h-full object-cover" />
                  <button onClick={() => saveData({...data, gallery: data.gallery.filter(gid => gid !== id)})} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg"><X size={14}/></button>
                </div>
              ))}
              {data.gallery.length < 6 && (
                <label className="aspect-square bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-rose-100 transition-all text-rose-300">
                  {isUploading ? <Loader2 className="animate-spin"/> : <><Plus size={24}/><span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Subir</span></>}
                  <input type="file" hidden accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0]; if (file) { const id = await handleFileUpload(file); if (id) saveData({...data, gallery: [...data.gallery, id]}); }
                  }} />
                </label>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-rose-100 space-y-6">
            <h3 className="font-bold text-amber-500 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border-b border-amber-50 pb-4"><Music size={16}/> Banda Sonora</h3>
            <div className="space-y-4">
              <FieldWithPresets label="Frase musical:" value={data.musicPhrase} onChange={(v) => saveData({...data, musicPhrase: v})} presets={PRESET_MUSIC} placeholder="Una frase especial..." />
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Link de YouTube:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input value={data.youtubeLink} onChange={e => saveData({...data, youtubeLink: e.target.value})} className="bg-amber-50 p-4 rounded-2xl flex-1 outline-none focus:ring-2 focus:ring-amber-200 text-sm" placeholder="https://www.youtube.com/watch?v=..." />
                  <div className="bg-amber-100 p-4 rounded-2xl text-amber-500 shadow-sm flex items-center justify-center"><LinkIcon size={20}/></div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-rose-100 space-y-4">
              <h3 className="font-bold text-rose-500 text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 border-b border-rose-50 pb-4"><Sparkles size={14}/> Razones</h3>
              <div className="space-y-2">
                {data.reasons.map((r, i) => (
                  <div key={i} className="flex gap-2 group">
                    <input value={r} onChange={e => { const nr = [...data.reasons]; nr[i] = e.target.value; saveData({...data, reasons: nr}); }} className="bg-rose-50 p-3 rounded-xl text-sm flex-1 outline-none group-hover:bg-rose-100 transition-colors" />
                    <button onClick={() => saveData({...data, reasons: data.reasons.filter((_, idx) => idx !== i)})} className="text-rose-200 hover:text-rose-500 transition-colors"><X size={14}/></button>
                  </div>
                ))}
                <button onClick={() => saveData({...data, reasons: [...data.reasons, ""]})} className="text-rose-400 text-[10px] font-black uppercase hover:underline">+ Añadir Razón</button>
              </div>
            </div>
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-sky-100 space-y-4">
              <h3 className="font-bold text-sky-500 text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 border-b border-sky-50 pb-4"><CheckCircle2 size={14}/> Promesas</h3>
              <div className="space-y-2">
                {data.promises.map((p, i) => (
                  <div key={i} className="flex gap-2 group">
                    <input value={p} onChange={e => { const np = [...data.promises]; np[i] = e.target.value; saveData({...data, promises: np}); }} className="bg-sky-50 p-3 rounded-xl text-sm flex-1 outline-none group-hover:bg-sky-100 transition-colors" />
                    <button onClick={() => saveData({...data, promises: data.promises.filter((_, idx) => idx !== i)})} className="text-sky-200 hover:text-sky-500 transition-colors"><X size={14}/></button>
                  </div>
                ))}
                <button onClick={() => saveData({...data, promises: [...data.promises, ""]})} className="text-sky-400 text-[10px] font-black uppercase hover:underline">+ Añadir Promesa</button>
              </div>
            </div>
          </div>

          <section className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-rose-100 space-y-6">
            <h3 className="font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border-b border-rose-50 pb-4"><Gift size={18}/> Vales de Amor</h3>
            <div className="space-y-3">
              {data.coupons.map((c, i) => (
                <div key={c.id} className="flex gap-2 group">
                   <input value={c.text} onChange={e => { const nc = [...data.coupons]; nc[i].text = e.target.value; saveData({...data, coupons: nc}); }} className="bg-rose-50 p-4 rounded-2xl flex-1 outline-none border-dashed border-2 border-rose-200 font-medium text-sm sm:text-base" placeholder="Ej. Vale por un abrazo..." />
                   <button onClick={() => saveData({...data, coupons: data.coupons.filter(val => val.id !== c.id)})} className="text-rose-300 hover:text-rose-500 transition-colors"><Trash2/></button>
                </div>
              ))}
              <button onClick={() => saveData({...data, coupons: [...data.coupons, { id: Date.now(), text: "" }]})} className="text-rose-500 font-black text-[10px] sm:text-xs uppercase hover:underline">+ Añadir Vale</button>
            </div>
          </section>

          <section className="bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-rose-100 space-y-4">
            <h3 className="font-bold text-rose-600 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border-b border-rose-50 pb-4"><HelpCircle size={18}/> La Propuesta</h3>
            <FieldWithPresets label="La pregunta:" value={data.proposalQuestion} onChange={(v) => saveData({...data, proposalQuestion: v})} presets={PRESET_PROPOSALS} placeholder="¿Quieres ser mi San Valentín?" />
          </section>

          <div className="text-center pt-10 pb-20">
            <button onClick={() => { if(confirm("¿Estás seguro de que quieres borrar todo?")) { setData(INITIAL_DATA); setPreviewUrls({}); setRedeemedCoupons([]); setIsProposalAccepted(false); } }} className="text-rose-300 hover:text-rose-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors">Reiniciar Todo</button>
          </div>
        </motion.main> 
      ) : ( 
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-40"> 
          <header className="h-[60vh] sm:h-[75vh] relative flex items-center justify-center overflow-hidden"> 
            <img src={data.moments[0]?.imageId ? previewUrls[data.moments[0].imageId] : 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?auto=format&fit=crop&q=80&w=1920'} className="absolute inset-0 w-full h-full object-cover" /> 
            <div className="absolute inset-0 bg-black/50"></div> 
            <div className="relative z-10 text-center text-white p-6 max-w-2xl space-y-2 sm:space-y-4"> 
              <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl sm:text-6xl md:text-8xl font-serif italic font-black drop-shadow-2xl">Para {data.targetName} ❤️</motion.h1> 
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-base sm:text-2xl md:text-3xl font-serif italic opacity-90">{data.shortPhrase}</motion.p> 
            </div> 
            <FloatingHearts />
          </header> 

          <main className="max-w-3xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24 -mt-16 sm:-mt-24 relative z-20 text-center"> 
            <section className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl border-4 border-rose-50 space-y-1 sm:space-y-2 transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform">
              <h2 className="text-rose-600 font-black tracking-[0.1em] sm:tracking-[0.3em] text-[10px] sm:text-sm uppercase mb-1">Días Juntos ✨</h2>
              <div className="text-5xl sm:text-8xl md:text-[10rem] font-black text-rose-500 leading-none tabular-nums tracking-tighter">{calculateDays(data.dateMet)}</div> 
              <div className="text-base sm:text-2xl font-serif italic text-slate-400">De felicidad compartida e infinita</div>
            </section> 

            <section className="bg-white p-8 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl italic font-serif text-lg sm:text-3xl leading-relaxed text-slate-700 relative text-left border-2 border-rose-50"> 
              <Quote className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 text-rose-100 w-10 h-10 sm:w-20 sm:h-20" />
              <div className="relative z-10"><Typewriter text={data.mainMessage} /></div>
            </section> 

            {data.youtubeLink && (
              <section className="bg-amber-50 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl border-2 border-amber-100 space-y-6 sm:space-y-8">
                <div className="relative inline-block">
                  <Disc className="text-amber-500 animate-[spin_4s_linear_infinite] w-14 h-14 sm:w-[84px] sm:h-[84px]" />
                  <Music className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-xl sm:text-4xl font-black text-amber-800 tracking-tight">Nuestra Canción 🎵</h3>
                  <p className="text-base sm:text-2xl italic text-amber-700 font-serif">"{data.musicPhrase}"</p>
                </div>
                <a href={data.youtubeLink} target="_blank" className="inline-flex items-center gap-2 sm:gap-4 bg-amber-500 text-white px-6 sm:px-12 py-3 sm:py-6 rounded-full font-black text-sm sm:text-xl shadow-2xl transition-all hover:bg-amber-600 hover:scale-105 active:scale-95 uppercase tracking-wider">Escuchar Ahora <ExternalLink size={18}/></a>
              </section>
            )}

            <section className="space-y-8 sm:space-y-16">
              <h2 className="text-2xl sm:text-5xl font-serif font-black text-rose-600 italic">Nuestra Historia 📖</h2>
              <div className="relative border-l-2 sm:border-l-4 border-rose-100 ml-2 sm:ml-6 pl-6 sm:pl-12 space-y-10 sm:space-y-20 text-left">
                {data.moments.map((m, idx) => (
                  <motion.div key={idx} initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="relative bg-white p-5 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-xl border border-rose-50 group transition-all">
                    <div className="absolute -left-[35px] sm:-left-[64px] top-4 sm:top-6 w-6 h-6 sm:w-10 sm:h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg ring-4 sm:ring-8 ring-rose-50"><Calendar size={12} sm:size={18}/></div>
                    {m.imageId && previewUrls[m.imageId] && <img src={previewUrls[m.imageId]} className="rounded-2xl sm:rounded-3xl h-40 sm:h-80 w-full object-cover mb-4 sm:mb-8 shadow-inner" />}
                    <h4 className="text-lg sm:text-3xl font-black mb-2 sm:mb-4 text-slate-800">{m.title}</h4>
                    <p className="text-slate-600 text-sm sm:text-xl leading-relaxed italic">{m.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {data.gallery.length > 0 && (
              <section className="space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-5xl font-serif font-black text-rose-600 italic">Álbum de Recuerdos 📸</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {data.gallery.map(id => (
                    <motion.div key={id} whileInView={{ scale: 1, opacity: 1 }} initial={{ scale: 0.9, opacity: 0 }} className="aspect-square rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white transform sm:hover:rotate-3 transition-transform">
                      <img src={previewUrls[id]} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 20, opacity: 0 }} className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl border border-rose-50">
                <h3 className="text-xl sm:text-3xl font-black text-rose-500 mb-6 sm:mb-8 flex items-center gap-3"><Sparkles size={24}/> Razones para amarte</h3>
                <div className="space-y-3 sm:space-y-4">
                  {data.reasons.map((r, i) => r && <div key={i} className="p-4 sm:p-5 bg-rose-50 rounded-2xl font-bold text-sm sm:text-lg text-rose-700 flex items-center gap-3"><Heart size={14} className="fill-rose-300 border-none shrink-0"/> {r}</div>)}
                </div>
              </motion.div>
              <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 20, opacity: 0 }} className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl border border-sky-50">
                <h3 className="text-xl sm:text-3xl font-black text-sky-500 mb-6 sm:mb-8 flex items-center gap-3"><CheckCircle2 size={24}/> Mis Promesas</h3>
                <div className="space-y-3 sm:space-y-4">{data.promises.map((p, i) => p && <div key={i} className="p-4 sm:p-5 bg-sky-50 rounded-2xl font-bold text-sm sm:text-lg text-sky-700 flex items-center gap-3 shrink-0">✅ {p}</div>)}</div>
              </motion.div>
            </div>

            <section className="space-y-8 sm:space-y-12"> 
              <h2 className="text-2xl sm:text-5xl font-black text-slate-800 tracking-tight">Vales Especiales 🎁</h2> 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8"> 
                {data.coupons.map((c) => { 
                  const isRedeemed = redeemedCoupons.includes(c.id); 
                  return ( 
                    <motion.div key={c.id} whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} className={`p-6 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] border-4 border-dashed flex flex-col justify-between shadow-2xl transition-all ${isRedeemed ? 'border-slate-200 opacity-60 bg-slate-100' : 'border-rose-200 bg-white'}`}> 
                      <p className="text-lg sm:text-3xl font-black text-slate-700 mb-6 sm:mb-10 italic leading-tight">{c.text}</p> 
                      <button id={`coupon-btn-${c.id}`} onClick={() => !isRedeemed && redeemCoupon(c.id)} className={`w-full py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-2xl shadow-xl transition-all ${isRedeemed ? 'bg-slate-300 text-slate-500' : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'}`}> 
                        {isRedeeming === c.id ? <Loader2 className="animate-spin mx-auto"/> : isRedeemed ? '¡CANJEADO! ✅' : 'CANJEAR VALE'} 
                      </button> 
                    </motion.div> 
                  ); 
                })} 
              </div> 
            </section> 

            <section className="py-12 sm:py-24 text-center"> 
              {!isProposalAccepted ? ( 
                <div className="bg-white p-8 sm:p-16 rounded-[3rem] sm:rounded-[6rem] border-[6px] sm:border-[12px] border-rose-100 shadow-2xl inline-block max-w-xl w-full"> 
                  <h2 className="text-2xl sm:text-5xl font-serif font-black text-rose-600 mb-10 italic leading-tight">{data.proposalQuestion}</h2> 
                  <button id="proposal-btn" onClick={() => { triggerConfetti('proposal-btn'); setIsProposalAccepted(true); }} className="bg-rose-600 text-white text-xl sm:text-4xl font-black py-5 sm:py-10 px-10 sm:px-24 rounded-full shadow-2xl animate-pulse transition-all hover:scale-110 active:scale-95">¡SÍ, ACEPTO! 💖</button> 
                </div> 
              ) : ( 
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 sm:p-24 rounded-[3rem] sm:rounded-[6rem] border-4 border-rose-100 shadow-2xl inline-block w-full max-w-2xl relative overflow-hidden"> 
                  <FloatingHearts />
                  <div className="text-6xl sm:text-[12rem] mb-4">🫂❤️</div> 
                  <h2 className="text-3xl sm:text-7xl font-serif font-black text-rose-600 drop-shadow-lg leading-tight">¡Juntos por siempre!</h2> 
                  <p className="mt-4 sm:mt-8 text-sm sm:text-2xl font-black uppercase tracking-[0.2em] text-slate-400">Amor Eterno</p>
                </motion.div> 
              )} 
            </section> 

            <footer className="text-center py-12 sm:py-20 space-y-4 sm:space-y-8 opacity-80"> 
              <p className="text-2xl sm:text-5xl font-serif italic text-rose-500">Con todo mi amor,</p>
              <p className="text-3xl sm:text-8xl font-serif font-black text-slate-800 tracking-tighter break-words px-4 leading-none">{data.senderName}</p>
            </footer>
          </main> 

          <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/95 backdrop-blur-2xl p-4 sm:p-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 border border-white/10 w-[90%] sm:w-auto justify-center"> 
            <button onClick={() => { setShowActionModal(true); setActionStep('select'); }} className="px-6 sm:px-14 py-4 sm:py-6 bg-rose-500 rounded-full text-white font-black text-base sm:text-2xl shadow-2xl uppercase tracking-widest transition-all hover:bg-rose-600 active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center"><Send size={20}/><span className="whitespace-nowrap">Obtener Regalo</span></button> 
          </div> 
        </motion.div> 
      )} 

      <AnimatePresence>
        {showActionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-[2rem] sm:rounded-[4rem] w-full max-w-lg p-6 sm:p-12 text-center space-y-6 sm:space-y-8 relative shadow-[0_30px_100px_rgba(0,0,0,0.6)] border-2 border-rose-50 overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowActionModal(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-rose-500 transition-colors p-2 z-10"><X size={24} sm:size={32}/></button>
              
              {actionStep === 'select' ? (
                <>
                  <div className="space-y-2 sm:space-y-4 pt-4 sm:pt-0">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">¡Casi listo! 💝</h3>
                    <p className="text-slate-500 font-bold text-xs sm:text-base">Selecciona cómo quieres entregar tu regalo</p>
                  </div>
                  <div className="grid gap-4 sm:gap-6">
                    <button onClick={() => setActionStep('notice')} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-8 bg-rose-50 border-2 sm:border-4 border-rose-100 rounded-[1.5rem] sm:rounded-[3rem] text-left transition-all hover:border-rose-300 group">
                      <div className="bg-rose-500 text-white p-3 sm:p-6 rounded-[1rem] sm:rounded-[2rem] group-hover:scale-110 transition-transform"><Download size={20} sm:size={32}/></div>
                      <div><p className="font-black text-rose-600 text-base sm:text-2xl leading-none">Descargar</p><p className="text-rose-400 font-bold uppercase tracking-widest text-[8px] sm:text-xs mt-1">Archivo Offline</p></div>
                    </button>
                    <button onClick={() => setActionStep('notice')} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-8 bg-sky-50 border-2 sm:border-4 border-sky-100 rounded-[1.5rem] sm:rounded-[3rem] text-left transition-all hover:border-sky-300 group">
                      <div className="bg-sky-500 text-white p-3 sm:p-6 rounded-[1rem] sm:rounded-[2rem] group-hover:scale-110 transition-transform"><LinkIcon size={20} sm:size={32}/></div>
                      <div><p className="font-black text-sky-600 text-base sm:text-2xl leading-none">Generar Link</p><p className="text-sky-400 font-bold uppercase tracking-widest text-[8px] sm:text-xs mt-1">Enlace Directo</p></div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6 sm:space-y-8 py-2 pt-4 sm:pt-0">
                  <div className="relative inline-block">
                    <div className="bg-rose-100 text-rose-500 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto ring-6 sm:ring-8 ring-rose-50">
                      <Gift size={32} sm:size={48} className="animate-bounce" />
                    </div>
                    <div className="absolute -top-1 -right-4 sm:-top-2 sm:-right-6 bg-amber-400 text-white text-[8px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full shadow-lg rotate-12 flex items-center gap-1 uppercase">
                      <BadgePercent size={10}/> OFERTA
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">Paso Final Requerido</h3>
                    
                    <div className="relative inline-flex flex-col items-center">
                       <span className="text-slate-400 line-through font-bold text-xs sm:text-lg">Antes S/ 29.90</span>
                       <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white px-5 sm:px-10 py-3 sm:py-4 rounded-[1rem] sm:rounded-3xl font-black text-xl sm:text-4xl shadow-xl border-b-4 border-rose-800 flex items-center gap-2">
                         S/ 9.90 <span className="text-[8px] sm:text-xs opacity-70 bg-white/20 px-2 py-1 rounded-lg uppercase">Pago Único</span>
                       </div>
                    </div>

                    <div className="bg-rose-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 text-center space-y-2">
                      <p className="text-sm sm:text-xl font-bold text-slate-700 leading-snug">
                        ¡Sorprende a <span className="text-rose-600 font-black">{data.targetName}</span> hoy mismo! 
                      </p>
                      <p className="text-[10px] sm:text-sm font-medium text-slate-500 leading-tight">
                        Obtén tu link permanente y el archivo final listo para enviar por WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20acabo%20de%20terminar%20mi%20regalo%20de%20San%20Valentín%20para%20${encodeURIComponent(data.targetName)}%20y%20quiero%20aprovechar%20la%20oferta%20de%20S/9.90%20para%20obtener%20el%20archivo/link%20final.`} target="_blank" rel="noopener" className="flex items-center justify-center gap-3 sm:gap-4 w-full bg-green-500 text-white py-4 sm:py-8 rounded-[1rem] sm:rounded-[2.5rem] font-black text-lg sm:text-3xl shadow-xl hover:bg-green-600 transition-all active:scale-95 border-b-4 border-green-700">
                      <MessageCircle size={20} sm:size={36} fill="white" /> CONTACTAR AHORA
                    </a>
                    <div className="flex justify-center items-center gap-2 sm:gap-4 text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>✓ Link</span>
                      <span>✓ Archivo</span>
                      <span>✓ Eterno</span>
                    </div>
                  </div>

                  <button onClick={() => setActionStep('select')} className="text-slate-300 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:text-slate-500 transition-colors pt-2">Volver atrás</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div> 
  ); 
}
