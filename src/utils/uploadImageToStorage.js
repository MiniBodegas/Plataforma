import { supabase } from '../lib/supabase'

export async function uploadImageToStorage(file, folder = 'mini-bodegas') {
  if (!file) return null
  if (typeof file === 'string') return file // ya es url
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${folder}/${fileName}`
  const { data, error } = await supabase.storage.from('imagenes').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(path)
  return urlData.publicUrl
}

export async function uploadMultipleImages(files = [], folder = 'carrusel') {
  const promises = files.map(f => uploadImageToStorage(f, folder).catch(e => { console.error('upload error', e); return null }))
  const results = await Promise.all(promises)
  return results.filter(Boolean)
}