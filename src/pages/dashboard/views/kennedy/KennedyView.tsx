import { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageCircle, Search, Filter, ChevronDown, 
  Save, FileCheck, Download, 
  Sparkles, Loader2, BookOpen, GraduationCap, 
  CreditCard, SearchX, ChevronRight, MapPin, 
  Phone, AlignLeft, History, X, User, Bot
} from 'lucide-react';
// Asegúrate de que este componente exista en tu proyecto, o cámbialo por un div con estilos
import { GlassCard } from '@/components/ui/GlassCard'; 
import { supabase } from '@/lib/supabaseClient';

// --- TIPOS E INTERFACES (Para mayor robustez) ---
interface Career {
  id: number;
  name: string;
  duration: string;
  modality: string;
  fees: number;
  subjects: number;
  evaluations_format?: string;
}

interface Student {
  id: number;
  full_name: string;
  dni: string;
  legajo: string;
  contact_phone: string;
  location: string;
  status: string;
  has_debt: boolean;
  general_notes: string;
  career_id: number;
  careers?: { name: string };
}

interface SelectedStudentUI {
  id: number;
  name: string;
  legajo: string;
  phone: string;
  location: string;
  status: string;
  debt: boolean;
  notes: string;
  career: string;
  careerId: number;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// --- CONFIGURACIÓN ---
const API_URL = import.meta.env.VITE_KENNEDY_API_URL || 'http://localhost:4001/api';

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
};

// --- CLIENTE API IA ---
const callBackendAI = async (payload: any): Promise<string> => {
  try {
    const headers = await getAuthHeader();
    
    // Si es array, es chat completo (messages). Si es string, es prompt simple.
    const body = Array.isArray(payload) 
      ? { messages: payload } 
      : { prompt: payload };
    
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error Detallado:", errorData); 
      throw new Error(errorData.error || `Error Backend: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result || "Sin respuesta.";
    
  } catch (error) {
    console.error("Error AI:", error);
    return "Error de conexión con el cerebro IA.";
  }
};

// --- COMPONENTE BADGE (Optimizado) ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Inscripto': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Documentación': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Solo Info': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Deudor': 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const activeStyle = styles[status] || styles['Solo Info'];
  
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border tracking-wider uppercase ${activeStyle}`}>
      {status}
    </span>
  );
};

// --- PARSER DE HISTORIAL (Limpieza de JSON de n8n) ---
const parseChatHistory = (rows: any[]) => {
    if (!rows || rows.length === 0) return "No hay historial disponible.";

    return rows.map((row) => {
        const msg = row.message; // Columna JSONB
        if (!msg) return null;

        const role = msg.type === 'human' ? '👤 ALUMNO' : '🤖 BOT';
        let content = msg.content || '';

        // Limpieza específica para mensajes que vienen de n8n/WhatsApp
        if (msg.type === 'human' && content.includes("Mensaje del paciente en texto:")) {
            const parts = content.split("Mensaje del paciente en texto:");
            if (parts.length > 1) {
                content = parts[1].split("Mensaje del paciente en transcripción")[0].trim();
            }
        }

        // Ignorar mensajes de error del sistema
        if (msg.type === 'ai' && content.includes("Agent stopped")) {
            return null;
        }

        return `[${role}]: ${content}`;
    })
    .filter(Boolean)
    .join("\n");
};

// --- COMPONENTE PRINCIPAL ---
export default function KennedyView() {
  // --- ESTADOS GENERALES ---
  const [students, setStudents] = useState<Student[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- BOT CONFIG ---
  const [botActive, setBotActive] = useState(true);
  const [welcomeText, setWelcomeText] = useState("");
  const [awayText, setAwayText] = useState("");
  const [isSavingBot, setIsSavingBot] = useState(false);
  const [isGeneratingBotConfig, setIsGeneratingBotConfig] = useState({ welcome: false, away: false });

  // --- FILTROS ---
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // --- FICHA ALUMNO ---
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudentUI | null>(null);
  const [studentDocuments, setStudentDocuments] = useState<any[]>([]);
  const [notesBuffer, setNotesBuffer] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // --- ESTADOS PARA EL HISTORIAL VISUAL ---
  const [showHistory, setShowHistory] = useState(false); 
  const [historyData, setHistoryData] = useState<any[]>([]); 
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- MODALES ---
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // --- IA ANALISTA ---
  const [analysisChat, setAnalysisChat] = useState<ChatMessage[]>([]);
  const [analysisInput, setAnalysisInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatContextRef = useRef<ChatMessage[]>([]); // Memoria del contexto original

  // --- EFFECTS ---
  useEffect(() => {
    fetchCareers();
    fetchBotConfig();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchStudents(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeFilter]);

  // --- API CALLS ---
  const fetchCareers = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/careers`, { headers });
      if (res.ok) setCareers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchBotConfig = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/bot`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBotActive(data.is_active);
        setWelcomeText(data.welcome_message);
        setAwayText(data.away_message);
      }
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    setLoadingData(true);
    try {
      const headers = await getAuthHeader();
      let url = `${API_URL}/students?search=${encodeURIComponent(searchTerm)}`;
      if (activeFilter) url += `&career_id=${activeFilter}`;
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        const result = await res.json();
        setStudents(result.data || []);
      }
    } catch (err) { console.error(err); } finally { setLoadingData(false); }
  };

  const fetchStudentDetails = async (id: number) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/students/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const s = data.student;
        const uiStudent: SelectedStudentUI = {
          id: s.id,
          name: s.full_name,
          legajo: s.legajo,
          phone: s.contact_phone,
          location: s.location,
          status: s.status,
          debt: s.has_debt,
          notes: s.general_notes,
          career: s.careers?.name || 'Sin Carrera',
          careerId: s.career_id
        };
        setSelectedStudent(uiStudent);
        setNotesBuffer(uiStudent.notes || '');
        setStudentDocuments(data.documents || []);
        
        // Resetear estados al abrir un nuevo alumno
        setAnalysisChat([]); 
        setShowHistory(false); // Empezar siempre colapsado
      }
    } catch (err) { console.error(err); }
  };

  // --- ACTION HANDLERS ---

  const toggleHistoryView = async () => {
    // Si vamos a abrir el historial (showHistory es false), cargamos los datos
    if (!showHistory && selectedStudent?.phone) {
        setLoadingHistory(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch(`${API_URL}/chat-history/${selectedStudent.phone}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setHistoryData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    }
    setShowHistory(!showHistory);
  };

  const toggleBotStatus = async () => {
    const newStatus = !botActive;
    setBotActive(newStatus);
    try {
      const headers = await getAuthHeader();
      await fetch(`${API_URL}/bot`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus, welcome_message: welcomeText, away_message: awayText })
      });
    } catch (err) {
      setBotActive(!newStatus); alert("Error de conexión");
    }
  };

  const saveBotSettings = async () => {
    setIsSavingBot(true);
    try {
      const headers = await getAuthHeader();
      await fetch(`${API_URL}/bot`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: botActive, welcome_message: welcomeText, away_message: awayText })
      });
      alert("Configuración guardada");
    } catch (err) { alert("Error"); } finally { setIsSavingBot(false); }
  };

  const saveNotes = async () => {
    if (!selectedStudent) return;
    setIsSavingNotes(true);
    try {
        const headers = await getAuthHeader();
        const res = await fetch(`${API_URL}/students/${selectedStudent.id}/notes`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: notesBuffer })
        });
        if (res.ok) setSelectedStudent({ ...selectedStudent, notes: notesBuffer });
        else alert("Error guardando notas");
    } catch (err) { alert("Error de conexión"); } finally { setIsSavingNotes(false); }
  };

  const downloadDocument = async (docId: number, fileName: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/documents/${docId}/download`, { headers });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch (err) { alert("Error en descarga"); }
  };

  // --- LOGICA IA ANALISTA ---
  const startAnalysis = async () => {
    if (!selectedStudent) return;
    setIsAnalyzing(true);
    
    try {
        const headers = await getAuthHeader();
        // 1. Obtener historial para dárselo a la IA
        const res = await fetch(`${API_URL}/chat-history/${selectedStudent.phone}`, { headers });
        let chatContextText = "";

        if (res.ok) {
            const rawHistory = await res.json();
            chatContextText = parseChatHistory(rawHistory);
        } else {
            chatContextText = "(Sin historial previo)";
        }

        // 2. Crear contexto del sistema
        const initialContext: ChatMessage[] = [
            { 
                role: "system", 
                content: `Eres un experto analista académico. Misión: analizar la conversación y perfil del alumno.
                DATOS: Nombre: ${selectedStudent.name} | Carrera: ${selectedStudent.career} | Estado: ${selectedStudent.status}
                HISTORIAL CHAT: ${chatContextText}
                Instrucciones: Responde brevemente. Identifica objeciones o interés de compra.` 
            }
        ];

        chatContextRef.current = initialContext;

        const firstMsg: ChatMessage = { role: "user", content: "Analiza el perfil y dime la probabilidad de inscripción/pago." };
        setAnalysisChat([firstMsg]); 

        const response = await callBackendAI([...initialContext, firstMsg]);
        setAnalysisChat(prev => [...prev, { role: "assistant", content: response }]);

    } catch (err) {
        console.error(err);
        setAnalysisChat([{ role: "assistant", content: "Error conectando con el historial." }]);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const sendAnalysisMessage = async () => {
    if (!analysisInput.trim()) return;
    
    const newUserMsg: ChatMessage = { role: "user", content: analysisInput };
    const newVisualChat = [...analysisChat, newUserMsg];
    
    setAnalysisChat(newVisualChat); 
    setAnalysisInput("");
    setIsAnalyzing(true);

    const fullPayload = [...chatContextRef.current, ...newVisualChat];

    const response = await callBackendAI(fullPayload);
    setAnalysisChat(prev => [...prev, { role: "assistant", content: response }]);
    setIsAnalyzing(false);
  };

  const generateBotMessage = async (type: 'welcome' | 'away') => {
    setIsGeneratingBotConfig(prev => ({ ...prev, [type]: true }));
    const result = await callBackendAI(`Genera mensaje corto de ${type === 'welcome' ? 'bienvenida' : 'ausencia'} WhatsApp instituto. Tono joven.`);
    if (type === 'welcome') setWelcomeText(result); else setAwayText(result);
    setIsGeneratingBotConfig(prev => ({ ...prev, [type]: false }));
  };

  // --- RENDER UI ---

  const handleOpenStudentModal = async (studentPreview: Student) => {
    setSelectedCareer(null);
    setIsModalVisible(true); 
    setTimeout(() => setIsModalOpen(true), 10);
    await fetchStudentDetails(studentPreview.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => { 
        setIsModalVisible(false); 
        setSelectedStudent(null); 
        setShowHistory(false); // Resetear historial al cerrar
    }, 300);
  };

  const handleOpenCareerModal = (c: Career) => { 
      setSelectedCareer(c); 
      setIsModalVisible(true); 
      setTimeout(() => setIsModalOpen(true), 10); 
  };

  const filteredCareers = careers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 p-1 min-h-screen pb-20 select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">
            <span className="text-blue-500">KENNEDY</span><span className="text-slate-500 text-2xl not-italic ml-1">SYSTEM</span>
          </h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] mt-1">Gestión académica • Automatización IA</p>
        </div>
        <div className="flex bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/50 shadow-2xl">
          {['dashboard', 'careers', 'bot'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105' : 'text-slate-400 hover:text-slate-200'}`}>
              {tab === 'dashboard' && <Users size={14}/>} {tab === 'careers' && <BookOpen size={14}/>} {tab === 'bot' && <MessageCircle size={14}/>}
              <span className="uppercase tracking-widest">{tab === 'dashboard' ? 'Alumnos' : tab === 'careers' ? 'Carreras' : 'Bot AI'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
            <div className="relative flex-1 w-full md:max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="text" placeholder="Buscar por nombre, DNI o Legajo..." className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-3 relative w-full md:w-auto" ref={filterMenuRef}>
              <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`flex items-center justify-center gap-3 px-6 py-3 border rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isFilterMenuOpen || activeFilter ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'}`}>
                <Filter size={16} /> <span>{activeFilter ? careers.find(c => c.id === activeFilter)?.name.substring(0, 15) : 'Filtrar'}</span> <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterMenuOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 border-b border-slate-800 bg-slate-800/30"><button onClick={() => { setActiveFilter(null); setIsFilterMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">Limpiar Filtros</button></div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">{careers.map(career => (<button key={career.id} onClick={() => { setActiveFilter(career.id); setIsFilterMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium rounded-xl transition-all ${activeFilter === career.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>{career.name}</button>))}</div>
                </div>
              )}
            </div>
          </div>

          {/* TABLA ALUMNOS */}
          <GlassCard className="border-slate-800/50 shadow-2xl !overflow-visible">
            {loadingData ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4 text-blue-500"><Loader2 className="animate-spin" size={40} /><p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Alumnos</p></div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <th className="px-8 py-5 border-b border-slate-800">Alumno</th>
                        <th className="px-6 py-5 border-b border-slate-800">Legajo</th>
                        <th className="px-6 py-5 border-b border-slate-800">Carrera</th>
                        <th className="px-6 py-5 border-b border-slate-800">Estado</th>
                        <th className="px-8 py-5 border-b border-slate-800 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {students.length > 0 ? students.map((student) => (
                        <tr key={student.id} onClick={() => handleOpenStudentModal(student)} className="group hover:bg-blue-600/[0.03] cursor-pointer transition-all duration-300">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-black text-sm border border-slate-600 group-hover:border-blue-500/50 transition-colors shadow-lg">{student.full_name.charAt(0)}</div>
                              <div>
                                <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{student.full_name}</div>
                                <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">DNI {student.dni}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-xs font-mono font-bold text-cyan-400/80 bg-cyan-400/5 px-2 py-1 rounded-md border border-cyan-400/10">#{student.legajo || '00000'}</span></td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-400 max-w-[180px] truncate">{student.careers?.name || 'S/D'}</td>
                          <td className="px-6 py-4"><StatusBadge status={student.status} /></td>
                          <td className="px-8 py-4 text-right"><div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-slate-700"><ChevronRight size={18} /></div></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-20 text-center"><div className="flex flex-col items-center gap-3 opacity-20"><SearchX size={60} /><p className="text-xs font-black uppercase tracking-widest">Base de datos vacía</p></div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* CAREERS TAB */}
      {activeTab === 'careers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
           {filteredCareers.map((career) => (
             <GlassCard key={career.id} className="p-0 overflow-hidden hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-xl">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20"><GraduationCap size={28} /></div>
                   <span className="bg-slate-800/80 text-slate-300 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-slate-700">{career.duration}</span>
                 </div>
                 <h3 className="font-black text-white text-lg mb-2 leading-tight uppercase">{career.name}</h3>
                 <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">{career.modality}</p>
                 <div className="flex items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-800 pt-5">
                    <div className="flex items-center gap-2"><CreditCard size={14} className="text-blue-500"/><span>{career.fees} Cuotas</span></div>
                    <div className="flex items-center gap-2"><BookOpen size={14} className="text-blue-500"/><span>{career.subjects} Materias</span></div>
                 </div>
               </div>
               <button onClick={() => handleOpenCareerModal(career)} className="w-full py-4 bg-slate-800/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all border-t border-slate-800">Ver Plan de Estudios</button>
             </GlassCard>
           ))}
        </div>
      )}

      {/* BOT TAB */}
      {activeTab === 'bot' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <GlassCard className="p-8 flex items-center justify-between border-slate-700/50 shadow-2xl">
            <div><h2 className="text-xl font-black text-white uppercase tracking-tighter">Status Operativo</h2><p className="text-xs text-slate-500 uppercase tracking-widest mt-1">El asistente responderá automáticamente vía WhatsApp.</p></div>
            <div className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in"><input type="checkbox" id="toggle" checked={botActive} onChange={toggleBotStatus} className="hidden" /><label htmlFor="toggle" className={`block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-300 border border-slate-700 ${botActive ? 'bg-green-600' : 'bg-slate-800'}`}><span className={`block w-5 h-5 mt-1 ml-1 rounded-full bg-white transition-transform duration-300 ${botActive ? 'translate-x-7' : 'translate-x-0'} shadow-lg`}></span></label></div>
          </GlassCard>
          <GlassCard className="p-8 space-y-8 border-slate-700/50 shadow-2xl">
            <h3 className="font-black text-white border-b border-slate-800 pb-4 flex items-center gap-3 text-sm uppercase tracking-[0.2em]"><Sparkles size={20} className="text-purple-400" /> Entrenamiento del Asistente</h3>
            {[{ label: "Mensaje de Bienvenida", val: welcomeText, set: setWelcomeText, key: 'welcome' }, { label: "Respuesta en Ausencia", val: awayText, set: setAwayText, key: 'away' }].map((item: any) => (
              <div key={item.key} className="space-y-3">
                <div className="flex justify-between items-end"><label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</label><button onClick={() => generateBotMessage(item.key)} disabled={isGeneratingBotConfig[item.key as 'welcome' | 'away']} className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-all flex items-center gap-2 border border-purple-500/20">{isGeneratingBotConfig[item.key as 'welcome' | 'away'] ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Optimizar con IA</button></div>
                <textarea className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm text-slate-300 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700 min-h-[100px]" value={item.val} onChange={(e) => item.set(e.target.value)} />
              </div>
            ))}
            <div className="pt-4 flex justify-end"><button onClick={saveBotSettings} disabled={isSavingBot} className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-50 flex items-center gap-3 shadow-xl transition-all active:scale-95"><Save size={18} />{isSavingBot ? 'Sincronizando' : 'Guardar Entrenamiento'}</button></div>
          </GlassCard>
        </div>
      )}

      {/* --- MODAL FLOTANTE (SLIDE-OVER) --- */}
      {isModalVisible && (
        <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-500 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={handleCloseModal} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-all"></div>
          
          {/* CONTENEDOR PRINCIPAL: Se redimensiona según showHistory */}
          <div className={`relative bg-slate-900 border-l border-slate-800 h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all duration-500 ease-out flex ${isModalOpen ? 'translate-x-0' : 'translate-x-full'} ${showHistory ? 'w-full max-w-6xl' : 'w-full max-w-lg'}`}>
            
            {/* Botón Cerrar */}
            <button onClick={handleCloseModal} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all z-50"><X size={24} /></button>

            {/* --- PANEL IZQUIERDO: HISTORIAL (Solo visible si showHistory = true) --- */}
            {showHistory && (
                  <div className="h-full w-2/3 flex flex-col bg-slate-950/50 border-r border-slate-800 animate-in fade-in slide-in-from-right-10 duration-500">
                      {/* Header Historial */}
                      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10 flex justify-between items-center">
                          <div>
                              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3"><MessageCircle className="text-green-500"/> Historial de Chat</h3>
                              <p className="text-xs text-slate-500 font-mono mt-1">Sesión: {selectedStudent?.phone || '...'} (n8n Logs)</p>
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">{historyData.length} Mensajes</div>
                      </div>
                      
                      {/* Lista Mensajes */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950">
                          {loadingHistory ? (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50"><Loader2 size={40} className="animate-spin text-blue-500"/><p className="text-xs font-black uppercase tracking-[0.2em]">Recuperando Logs...</p></div>
                          ) : historyData.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-30"><SearchX size={60}/><p className="text-xs font-black uppercase tracking-[0.2em]">No se encontró historial</p></div>
                          ) : (
                              historyData.map((row, idx) => {
                                  const msg = row.message;
                                  if (!msg) return null;
                                  
                                  const isHuman = msg.type === 'human';
                                  let content = msg.content || '';
                                  // Limpieza visual extra
                                  if (isHuman && content.includes("Mensaje del paciente en texto:")) content = content.split("Mensaje del paciente en texto:")[1].split("Mensaje del paciente en transcripción")[0].trim();
                                  if (msg.type === 'ai' && content.includes("Agent stopped")) return null;

                                  return (
                                      <div key={idx} className={`flex ${isHuman ? 'justify-start' : 'justify-end'}`}>
                                          <div className={`max-w-[80%] ${isHuman ? 'bg-slate-800 text-slate-200 rounded-bl-none' : 'bg-green-600/20 text-green-100 border border-green-500/30 rounded-br-none'} p-4 rounded-2xl shadow-md text-sm leading-relaxed`}>
                                              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest mb-2 opacity-50">
                                                  {isHuman ? <User size={10}/> : <Bot size={10}/>} {isHuman ? 'Alumno' : 'Kennedy Bot'}
                                              </div>
                                              {content}
                                          </div>
                                      </div>
                                  )
                              })
                          )}
                      </div>
                  </div>
            )}

            {/* --- PANEL DERECHO: FICHA ALUMNO (Siempre visible) --- */}
            <div className={`h-full overflow-y-auto custom-scrollbar p-10 flex-shrink-0 transition-all duration-500 ${showHistory ? 'w-1/3 bg-slate-900' : 'w-full'}`}>
            
            {selectedStudent && !selectedCareer && (
              <div className="animate-in fade-in duration-700 space-y-8">
                {/* CABECERA PERFIL */}
                <div className="text-center">
                  <div className="h-28 w-28 mx-auto rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl border-4 border-slate-900 ring-1 ring-slate-800">{selectedStudent.name.charAt(0)}</div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{selectedStudent.name}</h2>
                  <div className="flex flex-col items-center gap-2 mt-3">
                    <p className="text-blue-400 font-bold text-sm tracking-tight">{selectedStudent.career}</p>
                    {selectedStudent.legajo && <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase">Legajo #{selectedStudent.legajo}</span>}
                  </div>
                  <div className="mt-6 flex justify-center"><StatusBadge status={selectedStudent.status} /></div>
                </div>

                {/* CONTACTO */}
                <div className={`grid ${showHistory ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                    <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-xl text-blue-400"><Phone size={16} /></div>
                        <div className="overflow-hidden"><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Teléfono</p><p className="text-sm font-bold text-slate-200 truncate">{selectedStudent.phone || 'S/D'}</p></div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-xl text-red-400"><MapPin size={16} /></div>
                        <div className="overflow-hidden"><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ubicación</p><p className="text-sm font-bold text-slate-200 truncate">{selectedStudent.location || 'S/D'}</p></div>
                    </div>
                </div>

                {/* ACCIONES (WhatsApp y Toggle Historial) */}
                <div className={`grid ${showHistory ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <button className="flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-green-500 transition-all active:scale-95"><MessageCircle size={18} /><span>WhatsApp</span></button>
                  <button 
                    onClick={toggleHistoryView}
                    className={`flex items-center justify-center gap-3 py-4 border rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showHistory ? 'bg-blue-600 text-white border-blue-500' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  >
                      <History size={18} /><span>{showHistory ? 'Ocultar Chat' : 'Ver Historial'}</span>
                  </button>
                </div>

                {/* NOTAS */}
                <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-800 shadow-inner group focus-within:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black text-slate-500 flex items-center gap-3 uppercase tracking-[0.2em]"><AlignLeft size={16} className="text-blue-500"/> Notas Internas</h3>
                        <button onClick={saveNotes} disabled={isSavingNotes || notesBuffer === selectedStudent.notes} className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">{isSavingNotes ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                    <textarea className="w-full bg-transparent text-sm text-slate-300 border-none outline-none resize-none placeholder:text-slate-700 min-h-[100px]" placeholder="Escribe notas..." value={notesBuffer} onChange={(e) => setNotesBuffer(e.target.value)} />
                </div>

                {/* CHAT ANALISTA IA */}
                <div className="bg-slate-950/80 rounded-3xl p-6 border border-blue-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100} className="text-blue-500"/></div>
                    <h3 className="text-[10px] font-black text-blue-400 flex items-center gap-3 mb-4 uppercase tracking-[0.2em] relative z-10"><Sparkles size={16} /> Analista Académico IA</h3>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {analysisChat.length === 0 ? (
                            <div className="text-center py-8 text-slate-600">
                                <p className="text-xs mb-4 font-medium">Analiza el historial para detectar interés.</p>
                                <button onClick={startAnalysis} disabled={isAnalyzing} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto">
                                    {isAnalyzing ? <Loader2 className="animate-spin" size={14}/> : <Search size={14}/>} Iniciar Análisis
                                </button>
                            </div>
                        ) : (
                            analysisChat.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {isAnalyzing && analysisChat.length > 0 && (<div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700"><Loader2 size={14} className="animate-spin text-blue-400"/></div></div>)}
                    </div>
                    {analysisChat.length > 0 && (
                        <div className="flex gap-2 relative z-10">
                            <input type="text" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Haz una pregunta..." value={analysisInput} onChange={(e) => setAnalysisInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAnalysisMessage()} />
                            <button onClick={sendAnalysisMessage} disabled={isAnalyzing} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50"><ChevronRight size={16} /></button>
                        </div>
                    )}
                </div>

                {/* DOCUMENTOS */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2 border-l-4 border-blue-600">Legajo Digital</h3>
                  {studentDocuments.length > 0 ? (
                    <ul className="space-y-3">
                      {studentDocuments.map((doc) => (
                        <li key={doc.id} onClick={() => downloadDocument(doc.id, doc.file_name)} className="flex items-center justify-between text-xs font-bold text-slate-300 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-blue-500 hover:bg-blue-600/10 cursor-pointer group transition-all duration-300">
                          <div className="flex items-center gap-3"><FileCheck size={18} className="text-green-500" /> <span className="uppercase">{doc.document_type}</span></div>
                          <Download size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-xs text-slate-600 font-black uppercase tracking-widest p-10 bg-slate-950/30 rounded-3xl text-center border border-slate-900 border-dashed">Carpeta vacía</div>}
                </div>
              </div>
            )}

            {/* DETALLE CARRERA (En Modal) */}
            {selectedCareer && (
              <div className="p-10 w-full animate-in fade-in duration-700 space-y-8 overflow-y-auto">
                <div className="text-center pb-8 border-b border-slate-800">
                  <div className="h-24 w-24 mx-auto rounded-[2rem] bg-blue-900/20 flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20 shadow-inner"><GraduationCap size={48} /></div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">{selectedCareer.name}</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 bg-slate-800 px-4 py-1.5 rounded-full inline-block border border-slate-700">{selectedCareer.duration}</p>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50 text-center"><p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Inversión</p><p className="font-black text-white text-lg">{selectedCareer.fees} <span className="text-[10px] text-slate-500">CUOTAS</span></p></div>
                    <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50 text-center"><p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Estructura</p><p className="font-black text-white text-lg">{selectedCareer.subjects} <span className="text-[10px] text-slate-500">MATERIAS</span></p></div>
                  </div>
                  <div className="space-y-6 text-slate-300">
                    <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50"><p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-3">Modalidad de Cursado</p><p className="text-sm font-bold text-slate-300">{selectedCareer.modality}</p></div>
                    <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50"><p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-3">Esquema de Evaluación</p><p className="text-sm font-bold text-slate-300">{selectedCareer.evaluations_format}</p></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      
    </div>
      )}</div>
  );
}