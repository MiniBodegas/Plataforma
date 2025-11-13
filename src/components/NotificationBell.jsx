import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; 

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState(null);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook para navegación

  // 1. Optimizar localStorage con memoización
  const localStorageKey = `notificaciones_leidas_${user?.id || 'guest'}`;
  const localLeidasCache = useRef(null);

  // Cargar desde localStorage solo una vez
  const getLocalLeidasIds = () => {
    if (localLeidasCache.current) return localLeidasCache.current;
    
    try {
      const stored = localStorage.getItem(localStorageKey);
      localLeidasCache.current = stored ? JSON.parse(stored) : [];
      return localLeidasCache.current;
    } catch (e) {
      localLeidasCache.current = [];
      return [];
    }
  };

  // 2. Limitar la frecuencia de actualización de localStorage
  const markLocalLeida = (id) => {
    try {
      const ids = getLocalLeidasIds();
      if (!ids.includes(id)) {
        ids.push(id);
        localLeidasCache.current = ids; // Actualizar caché
        
        // Usar debounce para actualización de localStorage
        if (window._localStorageTimeout) clearTimeout(window._localStorageTimeout);
        window._localStorageTimeout = setTimeout(() => {
          localStorage.setItem(localStorageKey, JSON.stringify(ids));
        }, 300);
      }
    } catch (e) {
      console.error("Error guardando en localStorage:", e);
    }
  };

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (!error) {
        setNotificaciones(data || []);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    cargarNotificaciones();
    
    // Actualizar cada 2 minutos en lugar de cada minuto
    const interval = setInterval(cargarNotificaciones, 120000);
    return () => clearInterval(interval);
  }, [user]);

  // Marcar notificaciones como leídas cuando se abre el panel
  useEffect(() => {
    // Si se abre el panel y hay notificaciones no leídas, marcarlas como leídas después de 2 segundos
    if (isOpen && notificaciones.some(n => !n.leida)) {
      const timer = setTimeout(() => {
        marcarNotificacionesVisiblesComoLeidas();
      }, 2000); // Esperar 2 segundos para que el usuario pueda ver qué notificaciones son nuevas
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, notificaciones]);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setExpandedNotif(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Marcar notificaciones visibles como leídas - versión corregida
  const marcarNotificacionesVisiblesComoLeidas = async () => {
    if (!user || !notificaciones.length) return;

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);
    
    if (notificacionesNoLeidas.length === 0) return;
    
    try {
      // Obtener IDs de notificaciones no leídas
      const idsNoLeidas = notificacionesNoLeidas.map(n => n.id);
      
      // Actualizar en Supabase
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .in('id', idsNoLeidas)
        .select(); // Añadido para verificar la respuesta
    
      if (error) {
        throw error;
      }
    
      console.log('✓ Respuesta de actualización de notificaciones:', data);
    
      // Actualizar estado local solo si la actualización en DB fue exitosa
      if (data && data.length > 0) {
        setNotificaciones(prev => 
          prev.map(n => notificacionesNoLeidas.some(nl => nl.id === n.id) 
            ? {...n, leida: true} 
            : n
          )
        );
      
        console.log(`✅ ${notificacionesNoLeidas.length} notificaciones marcadas como leídas automáticamente`);
      } else {
        console.warn("⚠️ No se pudo verificar la actualización de notificaciones");
      }
    } catch (err) {
      console.error("❌ Error al marcar notificaciones como leídas:", err);
      alert("No se pudieron marcar las notificaciones como leídas. Verifica tus permisos.");
    }
  };

  // Marcar una notificación como leída - versión con más logs
  const marcarComoLeida = async (id) => {
    try {
      console.log(`⏳ Intentando marcar como leída notificación ID: ${id}`);
      
      const notif = notificaciones.find(n => n.id === id);
      console.log('Notificación encontrada:', notif);
      
      // Solo actualizar si no está leída
      if (notif && !notif.leida) {
        console.log('Enviando solicitud a Supabase...');
        
        const { data, error } = await supabase
          .from('notificaciones')
          .update({ leida: true })
          .eq('id', id)
          .select();
        
        console.log('Respuesta de Supabase:', { data, error });
        
        if (error) {
          console.error('Error detallado:', JSON.stringify(error));
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('✓ Notificación actualizada correctamente. Actualizando UI...');
          setNotificaciones(prev => 
            prev.map(n => n.id === id ? {...n, leida: true} : n)
          );
        } else {
          console.warn("⚠️ Supabase no devolvió errores pero tampoco datos actualizados");
        }
      } else {
        console.log('⚠️ La notificación ya está marcada como leída o no existe');
      }
    } catch (err) {
      console.error("❌ Error al actualizar notificación:", err);
    }
  };

  // Marcar todas como leídas - versión corregida
  const marcarTodasLeidas = async () => {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user.id)
        .eq('leida', false)
        .select(); // Añadido para verificar la respuesta
    
      if (error) {
        throw error;
      }
    
      console.log('✓ Todas las notificaciones marcadas como leídas en DB:', data);
    
      // Actualizar estado local solo si la actualización en DB fue exitosa
      if (data) {
        setNotificaciones(prev => 
          prev.map(notif => ({...notif, leida: true}))
        );
      } else {
        console.warn("⚠️ No se pudo verificar la actualización de todas las notificaciones");
      }
    } catch (err) {
      console.error("❌ Error al actualizar notificaciones:", err);
      alert("No se pudieron marcar todas las notificaciones como leídas. Verifica tus permisos.");
    }
  };

  // Contar no leídas
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  // 3. Optimizar la navegación tras hacer clic
  const handleNotificationClick = (id, notif) => {
    // Alternar la expansión
    setExpandedNotif(expandedNotif === id ? null : id);
    
    // Marcar como leída
    marcarComoLeida(id);
    
    // Navegar solo una vez y solo para notificaciones de reserva
    if (notif && notif.tipo === 'nueva_reserva') {
      // Evitar múltiples navegaciones usando un flag
      if (!window._isNavigating) {
        window._isNavigating = true;
        
        setTimeout(() => {
          setIsOpen(false);
          navigate('/mis-bodegas');
          // Reiniciar el flag después de navegar
          setTimeout(() => {
            window._isNavigating = false;
          }, 500);
        }, 300);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icono de campana con contador */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setExpandedNotif(null);
        }}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors relative focus:outline-none"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        
        {/* Indicador de notificaciones no leídas */}
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Menú desplegable de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notificaciones</h3>
            {noLeidas > 0 && (
              <button 
                onClick={marcarTodasLeidas}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className={`overflow-y-auto ${expandedNotif ? 'max-h-[500px]' : 'max-h-96'}`}>
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : notificaciones.length > 0 ? (
              notificaciones.map(notif => (
                <div 
                  key={notif.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-300 ${
                    !notif.leida ? 'bg-blue-50' : ''
                  } ${
                    expandedNotif === notif.id ? 'p-4' : 'p-3'
                  }`}
                  onClick={() => handleNotificationClick(notif.id, notif)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{notif.titulo}</h4>
                    <div className="flex items-center gap-1">
                      {!notif.leida && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          Nueva
                        </span>
                      )}
                      {expandedNotif === notif.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className={`text-sm text-gray-600 ${
                      expandedNotif === notif.id 
                        ? 'whitespace-pre-wrap break-words' 
                        : 'line-clamp-2'
                    }`}
                  >
                    {notif.mensaje}
                  </div>
                  
                  {expandedNotif === notif.id && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      {notif.reserva_id && (
                        <div className="text-xs text-gray-500 mb-1">
                          ID Reserva: <span className="font-mono">{notif.reserva_id}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(notif.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className={`text-xs ${getTipoNotificacionColor(notif.tipo)}`}>
                      {formatTipoNotificacion(notif.tipo)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No tienes notificaciones
              </div>
            )}
          </div>
          
          {notificaciones.length > 0 && (
            <div className="p-2 text-center border-t border-gray-200">
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {/* Navegar a página de todas las notificaciones */}}
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Función auxiliar para formatear el tipo de notificación
function formatTipoNotificacion(tipo) {
  const tipos = {
    'nueva_reserva': 'Nueva reserva',
    'reserva_aceptada': 'Reserva aceptada',
    'reserva_rechazada': 'Reserva rechazada',
    'reserva_cancelada': 'Cancelación',
    'recordatorio': 'Recordatorio'
  };
  
  return tipos[tipo] || tipo;
}

// Función auxiliar para color según tipo
function getTipoNotificacionColor(tipo) {
  const colores = {
    'nueva_reserva': 'text-purple-700',
    'reserva_aceptada': 'text-green-700',
    'reserva_rechazada': 'text-red-700',
    'reserva_cancelada': 'text-orange-700',
    'recordatorio': 'text-blue-700'
  };
  
  return colores[tipo] || 'text-gray-700';
}