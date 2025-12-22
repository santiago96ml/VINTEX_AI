import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MessageSquare, FileText, Edit, User } from 'lucide-react';
import { api } from '../../../../src/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SatelliteClient } from '@/types/satellite';
import { ClientModal } from '../modals/ChatModal';
import { ChatModal } from '../modals/ChatModal';
import { FilesModal } from '../modals/FilesModal';

export const PatientsView = () => {
  const [patients, setPatients] = useState<SatelliteClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para Modales
  const [editingClient, setEditingClient] = useState<SatelliteClient | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{open: boolean, phone: string, name: string}>({open: false, phone: '', name: ''});
  const [activeFiles, setActiveFiles] = useState<{open: boolean, id: number}>({open: false, id: 0});

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/initial-data');
      setPatients(data.clientes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredPatients = patients.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (p.dni && p.dni.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
          <Input placeholder="Buscar..." className="pl-9 bg-[#0a0a0a] border-white/10 text-white"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button onClick={() => { setEditingClient(null); setIsClientModalOpen(true); }} 
          className="bg-neon-main text-black hover:bg-emerald-400 font-bold">
          <Plus size={18} className="mr-2"/> Nuevo Cliente
        </Button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPatients.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-neon-main"><User size={14}/></div>
                  {p.nombre}
                </td>
                <td className="px-6 py-4 text-gray-400">{p.telefono}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setActiveChat({open: true, phone: p.telefono || '', name: p.nombre})} title="Historial Chat">
                    <MessageSquare size={16} className="text-blue-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setActiveFiles({open: true, id: p.id})} title="Archivos">
                    <FileText size={16} className="text-yellow-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingClient(p); setIsClientModalOpen(true); }} title="Editar">
                    <Edit size={16} className="text-gray-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} clientToEdit={editingClient} onSuccess={loadData} />
      <ChatModal isOpen={activeChat.open} onClose={() => setActiveChat({...activeChat, open: false})} telefono={activeChat.phone} nombreCliente={activeChat.name} />
      <FilesModal isOpen={activeFiles.open} onClose={() => setActiveFiles({...activeFiles, open: false})} clienteId={activeFiles.id} />
    </div>
  );
};