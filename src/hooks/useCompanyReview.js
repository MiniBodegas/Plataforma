import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Ajusta la ruta según tu proyecto

export function useCompanyReviews(empresaId) {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener usuario autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
    // Opcional: suscribirse a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Obtener reviews
  useEffect(() => {
    if (!empresaId) return;
    setLoading(true);
    supabase
      .from('empresa_review')
      .select('id, rating, comentario, usuario_id')
      .eq('empresa_id', empresaId)
      .then(({ data }) => {
        setReviews(data || []);
        setLoading(false);
      });
  }, [empresaId]);

  // Agregar nueva review (solo si logueado y no ha calificado antes)
  const addReview = async (rating, comentario = '') => {
    if (!user) return { error: 'Debes iniciar sesión para calificar.' };

    // Borra la review anterior del usuario para esta empresa
    await supabase
      .from('empresa_review')
      .delete()
      .eq('empresa_id', empresaId)
      .eq('usuario_id', user.id);

    // Inserta la nueva review
    const { error } = await supabase
      .from('empresa_review')
      .insert([{ empresa_id: empresaId, usuario_id: user.id, rating, comentario }]);

    if (!error) {
      // Opcional: recarga las reviews desde la base de datos
      const { data } = await supabase
        .from('empresa_review')
        .select('id, rating, comentario, usuario_id')
        .eq('empresa_id', empresaId);
      setReviews(data || []);
    }
    return { error };
  };

  // Calcular promedio
  const avg =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length
      : 0;

  return {
    reviews,
    average: avg,
    count: reviews.length,
    loading,
    addReview,
    user,
    yaCalifico: user ? reviews.some(r => r.usuario_id === user.id) : false
  };
}