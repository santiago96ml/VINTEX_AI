import { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageCircle, Search, Filter, ChevronDown, 
  Save, FileCheck, Download, FilePenLine, 
  Sparkles, Loader2, Copy, BookOpen, GraduationCap, 
  CreditCard, Info, SearchX, ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabaseClient';

// --- CONFIGURACIÓN ---
const API_URL = import.meta.env.VITE_KENNEDY_API_URL || 'http://localhost:4001/api';

// Ya no necesitamos la API Key aquí, ahora vive segura en el Backend

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
};

// Nueva función: Llama a TU Backend, no a OpenRouter directo
const callBackendAI = async (prompt: string): Promise<string> => {
  try {
    const headers = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error(`Error Backend: ${response.status}`);
    
    const data = await response.json();
    return data.result || "No se pudo generar respuesta.";
    
  } catch (error) {
    console.error("Error AI:", error);
    return "Error al conectar con la IA.";
  }
};

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

export default function KennedyView() {
  const [students, setStudents] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [botActive, setBotActive] = useState(true);
  const [welcomeText, setWelcomeText] = useState("");
  const [awayText, setAwayText] = useState("");
  const [isSavingBot, setIsSavingBot] = useState(false);

  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDocuments, setStudentDocuments] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBotConfig, setIsGeneratingBotConfig] = useState({ welcome: false, away: false });

  useEffect(() => {
    fetchCareers();
    fetchBotConfig();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeFilter]);

  // --- API CALLS ---
  const fetchCareers = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/careers`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCareers(data);
      }
    } catch (err) {
      console.error("Error cargando carreras", err);
    }
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
    } catch (err) {
      console.error("Error cargando bot", err);
    }
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
    } catch (err) {
      console.error("Error buscando alumnos", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStudentDetails = async (id: number) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/students/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const s = data.student;
        const uiStudent = {
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
        setStudentDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Error cargando detalles de alumno", err);
    }
  };

  const saveBotSettings = async () => {
    setIsSavingBot(true);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/bot`, {
        method: 'PUT',
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: botActive,
          welcome_message: welcomeText,
          away_message: awayText
        })
      });
      if (response.ok) {
        alert("Configuración guardada correctamente");
      } else {
        alert("Error al guardar");
      }
    } catch (err) {
      alert("Error al guardar");
      console.error(err);
    } finally {
      setIsSavingBot(false);
    }
  };

  const downloadDocument = async (docId: number, fileName: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/documents/${docId}/download`, { headers });
      
      if (!res.ok) throw new Error("Error en descarga");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error descargando:", err);
      alert("No se pudo descargar el archivo.");
    }
  };

  // Manejo de modales
  const handleOpenStudentModal = async (studentPreview: any) => {
    setGeneratedMessage('');
    setSelectedCareer(null);
    setIsModalVisible(true);
    setTimeout(() => setIsModalOpen(true), 10);
    await fetchStudentDetails(studentPreview.id);
  };

  const handleOpenCareerModal = (career: any) => {
    setSelectedCareer(career);
    setIsModalVisible(true);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsModalVisible(false);
      setSelectedStudent(null);
      setStudentDocuments([]);
      setSelectedCareer(null);
      setGeneratedMessage('');
    }, 300);
  };

  // IA - AHORA LLAMA AL BACKEND
  const generateStudentMessage = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    setGeneratedMessage('');
    const prompt = `Actúa como secretario de 'Punto Kennedy'. Mensaje WhatsApp para ${selectedStudent.name}. Legajo: ${selectedStudent.legajo || 'S/D'}. Carrera: ${selectedStudent.career}. Estado: ${selectedStudent.status}. Deuda: ${selectedStudent.debt ? 'SI' : 'NO'}. Notas: "${selectedStudent.notes}". Docs: ${studentDocuments.length}. Objetivo: Informar situación. Sé breve y amable.`;
    
    // Usamos callBackendAI en lugar de llamar directo a OpenRouter
    const result = await callBackendAI(prompt);
    setGeneratedMessage(result);
    setIsGenerating(false);
  };

  const generateBotMessage = async (type: 'welcome' | 'away') => {
    setIsGeneratingBotConfig(prev => ({ ...prev, [type]: true }));
    const context = type === 'welcome' ? "bienvenida" : "ausencia";
    
    const result = await callBackendAI(`Genera un mensaje corto de ${context} para WhatsApp de un instituto educativo llamado Punto Kennedy. Tono joven y profesional.`);
    
    if (type === 'welcome') setWelcomeText(result);
    else setAwayText(result);
    
    setIsGeneratingBotConfig(prev => ({ ...prev, [type]: false }));
  };

  const filteredCareers = careers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab === 'dashboard' && <Users size={14}/>}
              {tab === 'careers' && <BookOpen size={14}/>}
              {tab === 'bot' && <MessageCircle size={14}/>}
              <span className="uppercase tracking-widest">{tab === 'dashboard' ? 'Alumnos' : tab === 'careers' ? 'Carreras' : 'Bot AI'}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* BARRA DE HERRAMIENTAS */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
            <div className="relative flex-1 w-full md:max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, DNI o Legajo..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 relative w-full md:w-auto" ref={filterMenuRef}>
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center justify-center gap-3 px-6 py-3 border rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isFilterMenuOpen || activeFilter ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'}`}
              >
                <Filter size={16} />
                <span>{activeFilter ? careers.find(c => c.id === activeFilter)?.name.substring(0, 15) : 'Filtrar'}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterMenuOpen ? 'rotate-180' : ''}`}/>
              </button>
              
              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 border-b border-slate-800 bg-slate-800/30">
                    <button onClick={() => { setActiveFilter(null); setIsFilterMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">Limpiar Filtros</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {careers.map(career => (
                      <button key={career.id} onClick={() => { setActiveFilter(career.id); setIsFilterMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium rounded-xl transition-all ${activeFilter === career.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>{career.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABLA */}
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
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono font-bold text-cyan-400/80 bg-cyan-400/5 px-2 py-1 rounded-md border border-cyan-400/10">#{student.legajo || '00000'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-400 max-w-[180px] truncate">{student.careers?.name || 'S/D'}</td>
                          <td className="px-6 py-4"><StatusBadge status={student.status} /></td>
                          <td className="px-8 py-4 text-right">
                            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-slate-700"><ChevronRight size={18} /></div>
                          </td>
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

      {/* VISTA CARRERAS */}
      {activeTab === 'careers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
          {careers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((career) => (
            <GlassCard key={career.id} className="p-0 overflow-hidden hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20"><GraduationCap size={28} /></div>
                  <span className="bg-slate-800/80 text-slate-300 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-slate-700">{career.duration}</span>
                </div>
                <h3 className="font-black text-white text-lg mb-2 leading-tight group-hover:text-blue-400 transition-colors uppercase">{career.name}</h3>
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

      {/* VISTA BOT CONFIG */}
      {activeTab === 'bot' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <GlassCard className="p-8 flex items-center justify-between border-slate-700/50 shadow-2xl">
            <div><h2 className="text-xl font-black text-white uppercase tracking-tighter">Status Operativo</h2><p className="text-xs text-slate-500 uppercase tracking-widest mt-1">El asistente responderá automáticamente vía WhatsApp.</p></div>
            <div className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" id="toggle" checked={botActive} onChange={() => setBotActive(!botActive)} className="hidden" />
              <label htmlFor="toggle" className={`block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-300 border border-slate-700 ${botActive ? 'bg-green-600' : 'bg-slate-800'}`}>
                <span className={`block w-5 h-5 mt-1 ml-1 rounded-full bg-white transition-transform duration-300 ${botActive ? 'translate-x-7' : 'translate-x-0'} shadow-lg`}></span>
              </label>
            </div>
          </GlassCard>

          <GlassCard className="p-8 space-y-8 border-slate-700/50 shadow-2xl">
            <h3 className="font-black text-white border-b border-slate-800 pb-4 flex items-center gap-3 text-sm uppercase tracking-[0.2em]"><Sparkles size={20} className="text-purple-400" /> Entrenamiento del Asistente</h3>
            
            {[{ label: "Mensaje de Bienvenida", val: welcomeText, set: setWelcomeText, key: 'welcome' }, { label: "Respuesta en Ausencia", val: awayText, set: setAwayText, key: 'away' }].map((item: any) => (
              <div key={item.key} className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</label>
                  <button onClick={() => generateBotMessage(item.key)} disabled={isGeneratingBotConfig[item.key as 'welcome' | 'away']} className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-all flex items-center gap-2 border border-purple-500/20">
                    {isGeneratingBotConfig[item.key as 'welcome' | 'away'] ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Optimizar con IA
                  </button>
                </div>
                <textarea className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm text-slate-300 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700 min-h-[100px]" value={item.val} onChange={(e) => item.set(e.target.value)} />
              </div>
            ))}

            <div className="pt-4 flex justify-end">
              <button onClick={saveBotSettings} disabled={isSavingBot} className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-50 flex items-center gap-3 shadow-xl transition-all active:scale-95"><Save size={18} />{isSavingBot ? 'Sincronizando' : 'Guardar Entrenamiento'}</button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* MODAL SLIDE OVER */}
      {isModalVisible && (
        <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-500 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={handleCloseModal} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-all"></div>
          <div className={`relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] p-10 overflow-y-auto transform transition-transform duration-500 ease-out ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button onClick={handleCloseModal} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><SearchX size={24} /></button>

            {selectedStudent && !selectedCareer && (
              <div className="animate-in fade-in duration-700 space-y-10">
                <div className="text-center">
                  <div className="h-28 w-28 mx-auto rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl border-4 border-slate-900 ring-1 ring-slate-800">{selectedStudent.name.charAt(0)}</div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{selectedStudent.name}</h2>
                  <div className="flex flex-col items-center gap-2 mt-3">
                    <p className="text-blue-400 font-bold text-sm tracking-tight">{selectedStudent.career}</p>
                    {selectedStudent.legajo && <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase">Legajo Digital #{selectedStudent.legajo}</span>}
                  </div>
                  <div className="mt-6 flex justify-center"><StatusBadge status={selectedStudent.status} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-green-500 transition-all active:scale-95"><MessageCircle size={18} /><span>Abrir WhatsApp</span></button>
                  <button className="flex items-center justify-center gap-3 py-4 border border-slate-700 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"><FilePenLine size={18} /><span>Editar Perfil</span></button>
                </div>

                <div className="bg-purple-900/10 rounded-3xl p-6 border border-purple-500/20 shadow-inner">
                  <h3 className="text-[10px] font-black text-purple-400 flex items-center gap-3 mb-4 uppercase tracking-[0.2em]"><Sparkles size={16} /> Redacción Sugerida</h3>
                  {!generatedMessage && !isGenerating && <button onClick={generateStudentMessage} className="w-full py-3 bg-slate-800/80 text-purple-400 border border-purple-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Generar con IA</button>}
                  {isGenerating && <div className="text-center py-6 text-purple-400 text-xs font-black uppercase tracking-widest animate-pulse">Analizando Legajo...</div>}
                  {generatedMessage && (
                    <div className="space-y-4">
                      <textarea className="w-full text-sm p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-slate-300 min-h-[140px] outline-none" rows={5} value={generatedMessage} onChange={(e) => setGeneratedMessage(e.target.value)} />
                      <div className="flex justify-end"><button onClick={() => navigator.clipboard.writeText(generatedMessage)} className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2 hover:text-purple-300 transition-colors"><Copy size={14} /> Copiar al portapapeles</button></div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2 border-l-4 border-blue-600">Documentos del Alumno</h3>
                  {studentDocuments.length > 0 ? (
                    <ul className="space-y-3">
                      {studentDocuments.map((doc) => (
                        <li key={doc.id} onClick={() => downloadDocument(doc.id, doc.file_name)} className="flex items-center justify-between text-xs font-bold text-slate-300 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-blue-500 hover:bg-blue-600/10 cursor-pointer group transition-all duration-300">
                          <div className="flex items-center gap-3"><FileCheck size={18} className="text-green-500" /> <span className="uppercase">{doc.document_type}</span></div>
                          <Download size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-xs text-slate-600 font-black uppercase tracking-widest p-10 bg-slate-950/30 rounded-3xl text-center border border-slate-900 border-dashed">Carpeta de documentos vacía</div>}
                </div>
              </div>
            )}

            {selectedCareer && (
              <div className="animate-in fade-in duration-700 space-y-8">
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
      )}
    </div>
  );
}