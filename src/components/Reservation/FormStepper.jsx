import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useCreateReservation } from '../../hooks/useCreateReservation';
import { useNotifications } from '../../hooks/useNotifications';
import { supabase } from '../../lib/supabase';
import { PopUp as ConfirmationPopup } from "./PopUp";
import { useReservasByEmpresa } from '../../hooks/useReservasByEmpresa';
import {
  AuthStep,
  PersonalInfoStep,
  DateSelectionStep,
  ServicesStep,
  ProgressSteps,
  StepNavigation,
} from '../index';

export function FormStepper({ onDataChange, reservationData, onReservationSuccess }) {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { createReservation, loading: creatingReservation, error } = useCreateReservation();
  const { crearNotificacion } = useNotifications();
  const { reservas, refetch } = useReservasByEmpresa();

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

  // Refetch reservas al entrar al paso del calendario
  useEffect(() => {
    if (currentStep === 3) {
      refetch();
    }
  }, [currentStep, refetch]);

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
    } catch {
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
    } catch {
      setAuthError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Confirmar reserva con validación de disponibilidad
  const handleConfirmReservation = async () => {
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

    // Refresca reservas antes de validar
    await refetch();

    // Validar disponibilidad antes de crear la reserva
    const bodegaId = reservationData.bodegaSeleccionada?.id;
    const totalBodegas = Number(reservationData.bodegaSeleccionada?.cantidad ?? 1);

    const ocupadas = reservas.filter(r =>
      String(r.mini_bodega_id) === String(bodegaId) &&
      r.estado?.toLowerCase() === "aceptada" &&
      (!r.fecha_fin || new Date(r.fecha_fin) >= new Date())
    ).length;

    if (ocupadas >= totalBodegas) {
      setAuthError("Lo sentimos, esta bodega ya está reservada. Intenta con otra.");
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
      if (onReservationSuccess) {
        onReservationSuccess(reservationData.bodegaSeleccionada);
      }
      try {
        await enviarNotificacionProveedor(result, reservationData.bodegaSeleccionada, user);
      } catch (error) {
        console.error("Error al enviar notificación:", error);
      }
      setShowConfirmationPopup(true);
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

  // Notificación al propietario
  const enviarNotificacionProveedor = async (reserva, bodega, usuario) => {
    try {
      if (!bodega || !bodega.empresa_id) return false;
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('user_id, nombre')
        .eq('id', bodega.empresa_id)
        .single();
      if (empresaError || !empresa?.user_id) return false;
      const nombreBodega = bodega.nombre || bodega.titulo || bodega.descripcion || "Mini Bodega";
      const nombreEmpresa = empresa.nombre || "la empresa";
      return await crearNotificacion({
        user_id: empresa.user_id,
        empresa_id: bodega.empresa_id,
        tipo: 'nueva_reserva',
        titulo: '¡Nueva solicitud de reserva!',
        mensaje: `El usuario ${usuario?.user_metadata?.full_name || formData.nombre || 'Cliente'} ha solicitado reservar la bodega "${nombreBodega}" de ${nombreEmpresa} a partir del ${new Date(formData.fechaInicio).toLocaleDateString()}.`,
        reserva_id: reserva.id || reserva.reservaId,
        leida: false
      });
    } catch {
      return false;
    }
  };

  const steps = [
    { number: 1, title: showLogin ? "Inicio de sesión" : "Registro", completed: currentStep > 1 },
    { number: 2, title: "Información Personal", completed: currentStep > 2 },
    { number: 3, title: "Fecha de Inicio", completed: currentStep > 3 },
    { number: 4, title: "Servicios y Confirmación", completed: currentStep > 4 },
  ];

  const handleInputChange = (field) => (event) => {
    handleFormChange(field, event.target.value);
    if (authError) setAuthError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
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

      <ProgressSteps steps={steps} currentStep={currentStep} />

      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {authError}
        </div>
      )}

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
            reservas={reservas}
            empresaId={reservationData.bodegaSeleccionada?.empresa_id}
            bodegaId={reservationData.bodegaSeleccionada?.id}
            totalBodegas={Number(reservationData.bodegaSeleccionada?.cantidad ?? 1)}
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
