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

const OPENROUTER_API_KEY = "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"; // ⚠️ Pega tu Key aquí o usa .env
const AI_MODEL = "xiaomi/mimo-v2-flash:free";

// Helper de IA (OpenRouter)
const callOpenRouter = async (prompt: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) return "Sistema de IA no configurado.";
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`Error OpenRouter: ${response.status}`);
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No se pudo generar respuesta.";
    
  } catch (error) {
    console.error("Error AI:", error);
    return "Error al conectar con la IA.";
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Inscripto': 'bg-green-100 text-green-800 border-green-200',
    'Documentación': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Solo Info': 'bg-gray-100 text-gray-800 border-gray-200',
    'Deudor': 'bg-red-100 text-red-800 border-red-200',
  };
  const activeStyle = styles[status] || styles['Solo Info'];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeStyle}`}>
      {status}
    </span>
  );
};

// Tipo para los headers que siempre será válido
type AuthHeaders = Record<string, string>;

const getAuthHeader = async (): Promise<AuthHeaders> => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    console.warn("No hay sesión activa en Vintex");
    return {}; // Headers vacíos (seguro para fetch)
  }
  
  return { 'Authorization': `Bearer ${token}` };
};

export default function KennedyView() {
  // Estados (sin cambios relevantes)
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

  // Carga inicial
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

  // Manejo de modales y generadores IA (sin cambios, funcionan bien)
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

  const generateStudentMessage = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    setGeneratedMessage('');
    const prompt = `Actúa como secretario de 'Punto Kennedy'. Mensaje WhatsApp para ${selectedStudent.name}. Carrera: ${selectedStudent.career}. Estado: ${selectedStudent.status}. Deuda: ${selectedStudent.debt ? 'SI' : 'NO'}. Notas: "${selectedStudent.notes}". Docs: ${studentDocuments.length}. Objetivo: Informar situación. Sé breve y amable.`;
    
    const result = await callOpenRouter(prompt);
    setGeneratedMessage(result);
    setIsGenerating(false);
  };

  const generateBotMessage = async (type: 'welcome' | 'away') => {
    setIsGeneratingBotConfig(prev => ({ ...prev, [type]: true }));
    const context = type === 'welcome' ? "bienvenida" : "ausencia";
    
    const result = await callOpenRouter(`Genera un mensaje corto de ${context} para WhatsApp de un instituto educativo llamado Punto Kennedy. Tono joven y profesional.`);
    
    if (type === 'welcome') setWelcomeText(result);
    else setAwayText(result);
    
    setIsGeneratingBotConfig(prev => ({ ...prev, [type]: false }));
  };

  const filteredCareers = careers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-1 min-h-screen pb-20">
      {/* Menú de pestañas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
           <span className="text-blue-400">Kennedy</span>
          </h2>
          <p className="text-gray-400 text-sm">Gestión académica y automatización</p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            <Users size={16} className="inline mr-2"/> Alumnos
          </button>
          <button onClick={() => setActiveTab('careers')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'careers' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            <BookOpen size={16} className="inline mr-2"/> Carreras
          </button>
          <button onClick={() => setActiveTab('bot')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'bot' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
            <MessageCircle size={16} className="inline mr-2"/> Bot WhatsApp
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Búsqueda y filtros */}
          <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar alumno por nombre o DNI..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 relative w-full md:w-auto" ref={filterMenuRef}>
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors w-full md:w-auto justify-center ${activeFilter ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-gray-300 hover:bg-slate-800'}`}
              >
                <Filter size={18} />
                <span>{activeFilter ? careers.find(c => c.id === activeFilter)?.name.substring(0, 15) + '...' : 'Filtrar Carrera'}</span>
                <ChevronDown size={14}/>
              </button>
              
              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto">
                  <button onClick={() => { setActiveFilter(null); setIsFilterMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-slate-700">Ver Todas</button>
                  {careers.map(career => (
                    <button key={career.id} onClick={() => { setActiveFilter(career.id); setIsFilterMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 truncate">{career.name}</button>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Tabla de alumnos */}
          <GlassCard className="overflow-hidden">
            {loadingData ? (
              <div className="p-12 flex justify-center text-blue-400"><Loader2 className="animate-spin" size={32} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Alumno</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Carrera</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.length > 0 ? students.map((student) => (
                      <tr key={student.id} onClick={() => handleOpenStudentModal(student)} className="group hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <td className="px-6 py-4 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold mr-3">{student.full_name.charAt(0)}</div>
                          <div>
                            <div className="font-medium text-white">{student.full_name}</div>
                            <div className="text-xs text-gray-500">{student.dni}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{student.careers?.name || 'Sin Carrera'}</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <StatusBadge status={student.status} />
                          
                        </td>
                        <td className="px-6 py-4 text-blue-400 text-sm font-medium group-hover:text-blue-300">Ver Ficha <ChevronRight size={16} className="inline" /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-12 text-center text-gray-500"><SearchX size={48} className="mx-auto mb-2 opacity-50" /><p>No se encontraron alumnos.</p></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Vista Carreras (sin cambios) */}
      {activeTab === 'careers' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career) => (
              <GlassCard key={career.id} className="p-0 overflow-hidden hover:border-blue-500/50 transition-colors group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><GraduationCap size={24} /></div>
                    <span className="bg-slate-800 text-gray-300 text-xs px-2 py-1 rounded font-medium">{career.duration}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{career.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{career.modality}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-1"><CreditCard size={14} /><span>{career.fees} cuotas</span></div>
                    <div className="flex items-center gap-1"><BookOpen size={14} /><span>{career.subjects} materias</span></div>
                  </div>
                </div>
                <button onClick={() => handleOpenCareerModal(career)} className="w-full py-3 bg-slate-800/50 text-blue-400 text-sm font-semibold hover:bg-slate-800 transition-colors border-t border-slate-700">Ver Detalles</button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Vista Bot (sin cambios) */}
      {activeTab === 'bot' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GlassCard className="p-6 flex items-center justify-between">
            <div><h2 className="text-lg font-bold text-white">Estado del Bot</h2><p className="text-sm text-gray-400">Activa o desactiva las respuestas automáticas.</p></div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="toggle" checked={botActive} onChange={() => setBotActive(!botActive)} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300" style={{ right: botActive ? '0' : 'auto', left: botActive ? 'auto' : '0' }} />
              <label htmlFor="toggle" className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${botActive ? 'bg-green-500' : 'bg-gray-600'}`}></label>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-5">
            <h3 className="font-semibold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><Sparkles size={18} className="text-purple-400" /> Configuración IA (Xiaomi Mimo)</h3>
            
            {[
              { label: "Mensaje de Bienvenida", val: welcomeText, set: setWelcomeText, key: 'welcome' },
              { label: "Mensaje de Ausencia", val: awayText, set: setAwayText, key: 'away' }
            ].map((item: any) => (
              <div key={item.key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">{item.label}</label>
                  <button 
                    onClick={() => generateBotMessage(item.key)} 
                    disabled={isGeneratingBotConfig[item.key as 'welcome' | 'away']} 
                    className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-500/20"
                  >
                    {isGeneratingBotConfig[item.key as 'welcome' | 'away'] ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Generar
                  </button>
                </div>
                <textarea 
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none" 
                  rows={3} 
                  value={item.val} 
                  onChange={(e) => item.set(e.target.value)} 
                />
              </div>
            ))}

            <div className="pt-2 text-right">
              <button onClick={saveBotSettings} disabled={isSavingBot} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2 ml-auto">
                <Save size={16} />{isSavingBot ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Modal Slide Over */}
      {isModalVisible && (
        <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={handleCloseModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"></div>
          <div className={`relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><SearchX size={24} /></button>

            {selectedStudent && !selectedCareer && (
              <div className="animate-in fade-in duration-300">
                {/* ... resto del contenido del modal de alumno sin cambios ... */}
                <div className="mt-2 text-center">
                  <div className="h-24 w-24 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-white text-3xl font-bold mb-4 border-2 border-slate-700">{selectedStudent.name.charAt(0)}</div>
                  <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                  <div className="flex justify-center gap-2 mt-2">
                    <p className="text-blue-400 font-medium">{selectedStudent.career}</p>
                    {selectedStudent.careerId && <button onClick={() => handleOpenCareerModal(careers.find(c => c.id === selectedStudent.careerId))} className="text-xs bg-slate-800 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1 border border-slate-700"><Info size={12} /> Plan</button>}
                  </div>
                  <div className="mt-4 flex justify-center"><StatusBadge status={selectedStudent.status} /></div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8 pb-6 border-b border-slate-800">
                  <button className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"><MessageCircle size={18} /><span>WhatsApp</span></button>
                  <button className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-slate-700 text-gray-300 rounded-xl hover:bg-slate-800"><FilePenLine size={18} /><span>Editar</span></button>
                </div>

                <div className="mt-6 bg-purple-900/10 rounded-xl p-4 border border-purple-500/20">
                  <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-3"><Sparkles size={16} /> Redactor IA</h3>
                  {!generatedMessage && !isGenerating && <button onClick={generateStudentMessage} className="w-full py-2 bg-slate-800 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium flex justify-center gap-2 hover:bg-slate-700">Redactar mensaje</button>}
                  {isGenerating && <div className="text-center py-4 text-purple-400 text-sm flex justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Creando...</div>}
                  {generatedMessage && (
                    <div>
                      <textarea className="w-full text-sm p-3 rounded-lg bg-slate-900 border border-purple-500/30 text-gray-300 mb-2" rows={4} value={generatedMessage} onChange={(e) => setGeneratedMessage(e.target.value)} />
                      <div className="flex justify-end"><button onClick={() => navigator.clipboard.writeText(generatedMessage)} className="text-xs text-purple-400 font-medium flex gap-1 hover:text-purple-300"><Copy size={12} /> Copiar</button></div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Legajo Digital</h3>
                  {studentDocuments.length > 0 ? (
                    <ul className="space-y-2">
                      {studentDocuments.map((doc) => (
                        <li key={doc.id} onClick={() => downloadDocument(doc.id, doc.file_name)} className="flex items-center justify-between text-sm text-gray-300 p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500 cursor-pointer group transition-colors">
                          <div className="flex items-center"><FileCheck size={16} className="text-green-500 mr-2" /> {doc.document_type}</div>
                          <Download size={14} className="text-gray-500 group-hover:text-blue-400" />
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-sm text-gray-500 italic p-3 bg-slate-800/30 rounded text-center border border-slate-800">Carpeta vacía.</div>}
                </div>
              </div>
            )}

            {selectedCareer && (
              <div className="animate-in fade-in duration-300">
                <div className="mt-2 text-center pb-6 border-b border-slate-800">
                  <div className="h-20 w-20 mx-auto rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500 mb-4"><GraduationCap size={40} /></div>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedCareer.name}</h2>
                  <p className="text-gray-400 text-sm mt-2 font-medium bg-slate-800 inline-block px-3 py-1 rounded-full">{selectedCareer.duration}</p>
                </div>
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800 p-3 rounded-lg text-center"><p className="text-xs text-blue-400 font-bold uppercase">Cuotas</p><p className="font-bold text-white">{selectedCareer.fees}</p></div>
                    <div className="bg-slate-800 p-3 rounded-lg text-center"><p className="text-xs text-blue-400 font-bold uppercase">Materias</p><p className="font-bold text-white">{selectedCareer.subjects}</p></div>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <div className="border-b border-slate-800 pb-3"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Modalidad</p><p className="text-sm">{selectedCareer.modality}</p></div>
                    <div className="border-b border-slate-800 pb-3"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Evaluaciones</p><p className="text-sm">{selectedCareer.evaluations_format}</p></div>
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