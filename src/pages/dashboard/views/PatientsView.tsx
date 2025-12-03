import { useState } from 'react';
import { Search, Phone, Calendar, MessageSquare, FolderOpen, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ChatModal } from '../modals/ChatModal';
import { FilesModal } from '../modals/FilesModal';

export const PatientsView = ({ pacientes, citas, satelliteFetch, reload }: any) => {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalType, setModalType] = useState<'chat' | 'files' | null>(null);

  // Filtrado
  const filtered = pacientes.filter((p: any) => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    p.dni?.includes(search) || 
    p.telefono?.includes(search)
  );

  const handleToggleBot = async (p: any) => {
    await satelliteFetch(`/clientes/${p.id}`, { 
      method: 'PATCH', 
      body: JSON.stringify({ activo: !p.activo }) 
    });
    reload();
  };

  const handleResolveSecretary = async (p: any) => {
    if (!p.solicitud_de_secretaría) return;
    await satelliteFetch(`/clientes/${p.id}`, { 
      method: 'PATCH', 
      body: JSON.stringify({ solicitud_de_secretaria: false }) 
    });
    reload();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-tech-card p-4 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white">Registro de Pacientes</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input 
            className="dark-input pl-10" 
            placeholder="Buscar por nombre, DNI o teléfono..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {filtered.map((p: any) => {
          // Obtener última cita
          const lastCita = citas
            .filter((c: any) => c.cliente_id === p.id)
            .sort((a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0];

          return (
            <div key={p.id} className="bg-tech-card p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {p.nombre}
                    {p.solicitud_de_secretaría && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <AlertCircle size={12} /> Solicita Atención
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-2"><Phone size={14}/> {p.telefono}</span>
                    <span className="flex items-center gap-2"><FileText size={14}/> DNI: {p.dni || 'N/A'}</span>
                    <span className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14}/> 
                      {lastCita ? `${format(new Date(lastCita.fecha_hora), 'dd/MM/yy HH:mm')} (${lastCita.estado})` : 'Sin citas'}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${p.activo ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                  {p.activo ? 'Bot Activo' : 'Bot Inactivo'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-800">
                <button 
                  onClick={() => handleToggleBot(p)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${p.activo ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                >
                  {p.activo ? 'Desactivar Bot' : 'Activar Bot'}
                </button>
                
                <button 
                  onClick={() => handleResolveSecretary(p)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${p.solicitud_de_secretaría ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-gray-800 text-gray-500 cursor-default'}`}
                >
                  {p.solicitud_de_secretaría ? 'Resolver Solicitud' : 'Resuelta'}
                </button>

                <button 
                  onClick={() => { setSelectedPatient(p); setModalType('chat'); }}
                  className="py-2 px-3 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Ver Chat
                </button>

                <button 
                  onClick={() => { setSelectedPatient(p); setModalType('files'); }}
                  className="py-2 px-3 rounded-lg text-sm font-medium bg-neon-main text-black hover:bg-neon-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-neon-main/20"
                >
                  <FolderOpen size={16} /> Archivos
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalType === 'chat' && (
        <ChatModal 
          patient={selectedPatient} 
          onClose={() => setModalType(null)} 
          satelliteFetch={satelliteFetch} 
        />
      )}
      
      {modalType === 'files' && (
        <FilesModal 
          patient={selectedPatient} 
          onClose={() => setModalType(null)} 
          satelliteFetch={satelliteFetch} 
        />
      )}
    </div>
  );
};