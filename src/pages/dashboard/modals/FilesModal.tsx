import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2, Download } from 'lucide-react';
import { api } from '../../../../src/lib/api';
import { Button } from '@/components/ui/button';
import { ClientFile } from '@/types/satellite';
import { useToast } from '@/hooks/use-toast';

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
}

export const FilesModal: React.FC<FilesModalProps> = ({ isOpen, onClose, clienteId }) => {
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadFiles = () => {
    api.get<ClientFile[]>(`/api/files/${clienteId}`).then(res => setFiles(res.data || [])).catch(console.error);
  };

  useEffect(() => {
    if (isOpen && clienteId) loadFiles();
  }, [isOpen, clienteId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Obtener URL firmada
      const { data: { signedUrl, path } } = await api.post('/api/files/generate-upload-url', {
        fileName: file.name,
        clienteId
      });

      // 2. Subir directo a Supabase Storage (PUT)
      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      // 3. Confirmar en Backend
      await api.post('/api/files/confirm-upload', {
        clienteId,
        storagePath: path,
        fileName: file.name,
        fileType: file.type,
        fileSizeKB: Math.round(file.size / 1024)
      });

      toast({ title: "Archivo subido", description: "Documento guardado exitosamente." });
      loadFiles();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Falló la subida del archivo." });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Archivos Adjuntos</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 flex justify-end">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-neon-main text-black hover:bg-emerald-400">
              <Upload size={16} className="mr-2" /> {uploading ? 'Subiendo...' : 'Subir Archivo'}
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.length === 0 ? <p className="text-gray-500 text-center">No hay archivos.</p> : files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <FileText className="text-neon-main" size={20} />
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.file_name}</p>
                    <p className="text-xs text-gray-500">{file.file_size_kb} KB • {new Date(file.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {/* Aquí podrías agregar lógica para descargar usando otra URL firmada */}
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white"><Download size={16} /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};