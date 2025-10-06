import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useCreateReservation } from '../../hooks/useCreateReservation';
import { useNotifications } from '../../hooks/useNotifications';
import { supabase } from '../../lib/supabase'; 
import { ConfirmationPopup } from "./ConfirmationPopup";


import { AuthStep, 
  PersonalInfoStep, 
  DateSelectionStep, 
  ServicesStep,
  ProgressSteps,
  StepNavigation,
  }
  from '../index';

export function FormStepper({ onDataChange, reservationData, onReservationSuccess }) {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { createReservation, loading: creatingReservation, error } = useCreateReservation();
  const { crearNotificacion } = useNotifications();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    numeroCelular: '',
    fechaInicio: '',
    servicios: [],
    email: '',
    password: '',
    nombre: '',
    ...reservationData
  });

  // Verificar si el usuario ya está logueado al montar el componente
  useEffect(() => {
    if (user) {
      setCurrentStep(2);
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        nombre: user.user_metadata?.full_name || prev.nombre || '',
      }));
    }
  }, [user]);

  const handleFormChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(field, value);
    }
  };

  // Navegación entre pasos
  const nextStep = () => {
    // Validaciones por paso antes de avanzar
    if (currentStep === 1 && !user) {
      setAuthError('Debes iniciar sesión o registrarte para continuar');
      return;
    }
    
    if (currentStep === 2) {
      if (!formData.tipoDocumento || !formData.numeroDocumento || !formData.numeroCelular) {
        setAuthError('Por favor completa todos los campos requeridos');
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.fechaInicio) {
        setAuthError('Por favor selecciona una fecha de inicio');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setAuthError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setAuthError('');
    }
  };

  // Funciones de autenticación
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setAuthError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setAuthError(error.message === 'Invalid login credentials' 
          ? 'Credenciales incorrectas. Verifica tu email y contraseña.' 
          : error.message);
      } else {
        setCurrentStep(2);
      }
    } catch (err) {
      setAuthError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.password) {
      setAuthError('Por favor completa todos los campos');
      return;
    }

    if (formData.password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.nombre,
        user_type: 'usuario'
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setCurrentStep(2);
      }
    } catch (err) {
      setAuthError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Función para confirmar reserva
  const handleConfirmReservation = async () => {
    // Validar que todos los campos estén completos
    const requiredFields = ['tipoDocumento', 'numeroDocumento', 'numeroCelular', 'fechaInicio'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setAuthError(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
      return;
    }

    if (!reservationData?.bodegaSeleccionada) {
      setAuthError('No hay una bodega seleccionada');
      return;
    }

    const dataToSend = {
      ...reservationData,
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      numeroCelular: formData.numeroCelular,
      fechaInicio: formData.fechaInicio,
      servicios: formData.servicios
    };

    const result = await createReservation(dataToSend);

    if (result.success) {
      // Notificar éxito al componente padre
      if (onReservationSuccess) {
        onReservationSuccess(reservationData.bodegaSeleccionada);
      }
      
      // Intentar enviar notificación
      try {
        await enviarNotificacionProveedor(result, reservationData.bodegaSeleccionada, user);
      } catch (error) {
        console.error("Error al enviar notificación:", error);
      }
      
      // Mostrar popup
      setShowConfirmationPopup(true);
      
      // Redirigir después de 5 segundos
      setTimeout(() => {
        setShowConfirmationPopup(false);
        navigate('/', { 
          state: { 
            reservaConfirmada: true,
            bodegaReservada: reservationData.bodegaSeleccionada
          }
        });
      }, 5000);
    } else {
      setAuthError(`Error creando la reserva: ${result.error}`);
    }
  };

  // Función optimizada para enviar notificación al propietario correcto
  const enviarNotificacionProveedor = async (reserva, bodega, usuario) => {
    try {
      // Verificaciones iniciales
      if (!bodega || !bodega.empresa_id) {
        console.error("❌ No se puede enviar notificación: falta empresa_id");
        return false;
      }
      
      console.log("⏳ Buscando propietario para la empresa ID:", bodega.empresa_id);
      
      // Consultar directamente la tabla empresas para obtener el user_id asociado
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('user_id, nombre')
        .eq('id', bodega.empresa_id)
        .single();
      
      if (empresaError || !empresa?.user_id) {
        console.error("❌ No se encontró el propietario de la empresa:", empresaError);
        return false;
      }
      
      console.log("✓ Propietario encontrado:", empresa.user_id);
      
      // Obtener nombre de bodega de manera segura
      const nombreBodega = bodega.nombre || bodega.titulo || bodega.descripcion || "Mini Bodega";
      const nombreEmpresa = empresa.nombre || "la empresa";
      
      // Crear notificación para el propietario
      const resultado = await crearNotificacion({
        user_id: empresa.user_id, // ID del usuario propietario
        empresa_id: bodega.empresa_id,
        tipo: 'nueva_reserva',
        titulo: '¡Nueva solicitud de reserva!',
        mensaje: `El usuario ${usuario?.user_metadata?.full_name || formData.nombre || 'Cliente'} ha solicitado reservar la bodega "${nombreBodega}" de ${nombreEmpresa} a partir del ${new Date(formData.fechaInicio).toLocaleDateString()}.`,
        reserva_id: reserva.id || reserva.reservaId,
        leida: false
      });
      
      return resultado.success;
    } catch (error) {
      console.error("❌ Error inesperado al enviar notificación:", error);
      return false;
    }
  };

  // Definir la lista de pasos
  const steps = [
    { number: 1, title: showLogin ? "Inicio de sesión" : "Registro", completed: currentStep > 1 },
    { number: 2, title: "Información Personal", completed: currentStep > 2 },
    { number: 3, title: "Fecha de Inicio", completed: currentStep > 3 },
    { number: 4, title: "Servicios y Confirmación", completed: currentStep > 4 },
  ];

  // Simplificar manejo de inputs
  const handleInputChange = (field) => (event) => {
    handleFormChange(field, event.target.value);
    if (authError) setAuthError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Popup de Confirmación */}
      {showConfirmationPopup && (
        <ConfirmationPopup
          onClose={() => {
            setShowConfirmationPopup(false);
            navigate('/', { 
              state: { 
                reservaConfirmada: true,
                bodegaReservada: reservationData.bodegaSeleccionada
              }
            });
          }}
          bodegaData={reservationData.bodegaSeleccionada}
        />
      )}
      
      {/* Progress Steps */}
      <ProgressSteps steps={steps} currentStep={currentStep} />

      {/* Mensaje de error */}
      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {authError}
        </div>
      )}

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <AuthStep
            user={user}
            formData={formData}
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            loading={loading}
            handleLoginSubmit={handleLoginSubmit}
            handleRegisterSubmit={handleRegisterSubmit}
            handleInputChange={handleInputChange}
            nextStep={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <PersonalInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentStep === 3 && (
          <DateSelectionStep
            fechaInicio={formData.fechaInicio}
            handleFechaChange={(e) => handleFormChange('fechaInicio', e.target.value)}
          />
        )}

        {currentStep === 4 && (
          <ServicesStep
            formData={formData}
            handleFormChange={handleFormChange}
            error={error}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        prevStep={prevStep}
        nextStep={nextStep}
        isLastStep={currentStep === steps.length}
        onConfirm={handleConfirmReservation}
        isProcessing={creatingReservation}
      />
    </div>
  );
}
