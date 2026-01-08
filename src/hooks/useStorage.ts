import { useState } from 'react';
import axios from 'axios';

// Asegúrate de que esta URL apunte a tu backend satélite
const API_URL = import.meta.env.VITE_API_URL || 'https://clinica1.vintex.net.br//';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sube un archivo usando el flujo seguro de URLs firmadas
   */
  const uploadFile = async (file: File, clienteId: number) => {
    setUploading(true);
    setError(null);

    try {
      // 1. Obtener Token de Sesión
      const token = localStorage.getItem('access_token'); // O donde guardes tu JWT
      if (!token) throw new Error("No hay sesión activa");

      const config = {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        }
      };

      // 2. Paso 1: Pedir permiso y URL firmada al Backend
      const { data: signData } = await axios.post(`${API_URL}/api/files/generate-upload-url`, {
        fileName: file.name,
        clienteId: clienteId
      }, config);

      const { signedUrl, path } = signData;

      // 3. Paso 2: Subir el binario directamente a Supabase Storage (PUT)
      // NOTA: Aquí no usamos headers de auth propios, usamos la firma de la URL
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
          'x-amz-acl': 'private', // Opcional, depende de configuración bucket
        }
      });

      // 4. Paso 3: Confirmar al Backend para que guarde los metadatos
      const { data: fileData } = await axios.post(`${API_URL}/api/files/confirm-upload`, {
        clienteId,
        storagePath: path,
        fileName: file.name,
        fileType: file.type,
        fileSizeKB: Math.round(file.size / 1024)
      }, config);

      return fileData;

    } catch (err: any) {
      console.error("Upload Error:", err);
      const msg = err.response?.data?.error || "Error al subir archivo";
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, error };
};