import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationsList() {
  const { user } = useAuth();
  const [listaNotificaciones, setListaNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { marcarComoLeida, marcarTodasComoLeidas, cargarNotificaciones } = useNotifications();
  
  // Cargar todas las notificaciones
  useEffect(() => {
    async function cargarListaNotificaciones() {
      if (!user) return;
      
      try {
        setCargando(true);
        const { data, error } = await supabase
          .from('notificaciones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setListaNotificaciones(data || []);
      } catch (err) {
        console.error("Error al cargar lista de notificaciones:", err);
      } finally {
        setCargando(false);
      }
    }
    
    cargarListaNotificaciones();
  }, [user]);
  
  // Manejar clic en una notificación
  const handleNotificationClick = async (id) => {
    await marcarComoLeida(id);
    // Actualizar la lista local
    setListaNotificaciones(prev => 
      prev.map(n => n.id === id ? {...n, leida: true} : n)
    );
  };
  
  // Marcar todas como leídas
  const handleMarkAllRead = async () => {
    await marcarTodasComoLeidas();
    // Actualizar la lista local
    setListaNotificaciones(prev => 
      prev.map(n => ({...n, leida: true}))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2C3A61] flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notificaciones
        </h2>
        {listaNotificaciones.some(n => !n.leida) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-sm px-3 py-1 bg-[#2C3A61] text-white rounded-lg hover:bg-[#1e2a47]"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {cargando ? (
        <div className="text-center py-12">Cargando notificaciones...</div>
      ) : listaNotificaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tienes notificaciones
        </div>
      ) : (
        <div className="space-y-4">
          {listaNotificaciones.map(notificacion => (
            <div 
              key={notificacion.id} 
              className={`p-4 rounded-lg border ${
                notificacion.leida ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => !notificacion.leida && handleNotificationClick(notificacion.id)}
            >
              <div className="flex justify-between">
                <h3 className={`font-semibold ${notificacion.leida ? 'text-gray-700' : 'text-[#2C3A61]'}`}>
                  {notificacion.titulo}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(notificacion.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{notificacion.mensaje}</p>
              {!notificacion.leida && (
                <div className="mt-2 flex justify-end">
                  <button 
                    className="text-xs text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notificacion.id);
                    }}
                  >
                    Marcar como leída
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}