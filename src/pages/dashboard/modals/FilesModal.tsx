import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { useStorage } from '../../../hooks/useStorage';

export const FilesModal = ({ patient, onClose, satelliteFetch }: any) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { uploadFile, uploading } = useStorage(satelliteFetch);

  const loadFiles = async () => {
    try {
      const data = await satelliteFetch(`/files/${patient.id}`);
      if (data) setFiles(data);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadFiles(); }, [patient]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const success = await uploadFile(file, patient.id);
    if (success) loadFiles();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-tech-card w-full max-w-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1c20]">
          <h3 className="text-white font-bold text-lg">📂 Archivos de {patient.nombre}</h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>

        <div className="p-6">
          {/* AREA DE SUBIDA */}
          <label className={`border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-neon-main hover:bg-gray-800/30 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            {uploading ? (
              <Loader2 className="animate-spin text-neon-main mb-2" size={32} />
            ) : (
              <UploadCloud className="text-neon-main mb-2" size={32} />
            )}
            <span className="text-sm font-medium text-gray-300">
              {uploading ? 'Subiendo archivo...' : 'Click para subir archivo'}
            </span>
            <span className="text-xs text-gray-500 mt-1">PDF, Imágenes (Máx 10MB)</span>
          </label>

          {/* LISTA DE ARCHIVOS */}
          <div className="mt-6 space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {loadingData ? (
              <p className="text-center text-gray-500 py-4">Cargando archivos...</p>
            ) : files.length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">No hay archivos adjuntos.</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.file_type.includes('image') ? <ImageIcon size={18} className="text-purple-400"/> : <FileText size={18} className="text-blue-400"/>}
                    <div className="flex flex-col truncate">
                      <span className="text-sm text-gray-200 truncate">{file.file_name}</span>
                      <span className="text-xs text-gray-500">{(file.file_size_kb / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a 
                    href="#" 
                    className="text-neon-main hover:bg-neon-main/10 p-2 rounded-full transition-colors"
                    title="Descargar (Próximamente)"
                  >
                    <Download size={16} />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};