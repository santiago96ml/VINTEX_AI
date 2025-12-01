import { useState } from 'react';

export const useStorage = (satelliteFetch: any) => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, clienteId: number) => {
    setUploading(true);
    try {
      // 1. Pedir URL firmada
      const { signedUrl, path } = await satelliteFetch('/files/generate-upload-url', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          clienteId
        })
      });

      // 2. Subir directamente a Supabase (Bypass backend para velocidad)
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadRes.ok) throw new Error('Fallo al subir a la nube');

      // 3. Confirmar y guardar metadatos
      await satelliteFetch('/files/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          clienteId,
          storagePath: path,
          fileName: file.name,
          fileType: file.type,
          fileSizeKB: Math.ceil(file.size / 1024)
        })
      });

      return true;
    } catch (error) {
      console.error(error);
      alert('Error subiendo archivo');
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};