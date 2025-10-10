// utils/archivoUtils.js
import { supabase } from "../lib/supabase";

export const subirArchivo = async (file, empresaId, tipo, setUploadProgress) => {
  try {
    setUploadProgress(prev => ({ ...prev, [tipo]: 0 }));

    const fileExt = file.name.split('.').pop().toLowerCase();
    const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
    
    if (!extensionesPermitidas.includes(fileExt)) {
      throw new Error(`Extensión de archivo no permitida: .${fileExt}`);
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${tipo}-${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${empresaId}/${tipo}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documentos-empresas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;
    setUploadProgress(prev => ({ ...prev, [tipo]: 100 }));
    
    return data.path;
  } catch (error) {
    setUploadProgress(prev => ({ ...prev, [tipo]: 0 }));
    throw new Error(`Error al subir ${tipo}: ${error.message}`);
  }
};

export const descargarArchivo = async (empresaId, tipo, nombreArchivo) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos-empresas')
      .createSignedUrl(`${empresaId}/${tipo}/${nombreArchivo}`, 60);

    if (error) throw error;

    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = nombreArchivo;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw new Error('Error al descargar el archivo');
  }
};

export const obtenerUrlVistaPrevia = async (empresaId, tipo, nombreArchivo) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos-empresas')
      .createSignedUrl(`${empresaId}/${tipo}/${nombreArchivo}`, 300);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error obteniendo vista previa:', error);
    return null;
  }
};