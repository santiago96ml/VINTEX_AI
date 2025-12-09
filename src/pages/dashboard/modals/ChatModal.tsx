import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  telefonoCliente: string; // El número de teléfono es la clave de búsqueda
}

export default function ChatModal({ isOpen, onClose, telefonoCliente }: ChatModalProps) {
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && telefonoCliente) {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Llamada al nuevo endpoint de historial
      axios.get(`${import.meta.env.VITE_API_URL}/api/chat-history/${telefonoCliente}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setMensajes(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [isOpen, telefonoCliente]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historial de Chat (IA)</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full pr-4">
          {loading ? (
            <div className="text-center py-10">Cargando conversación...</div>
          ) : mensajes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay historial disponible para este número.</div>
          ) : (
            <div className="space-y-4">
              {mensajes.map((msg, idx) => (
                // Asumiendo que la estructura JSON de tu N8N guarda rol y contenido
                <div key={idx} className={`flex ${msg.message?.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-[80%] ${
                    msg.message?.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <p className="text-sm">{msg.message?.content || JSON.stringify(msg.message)}</p>
                    <span className="text-xs text-gray-400 block mt-1">
                      {new Date(msg.created_at || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}