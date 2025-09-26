import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useCreateReservation } from '../hooks/useCreateReservation';

export function FormStepper({ onDataChange, reservationData }) {
  const { user, signIn, signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
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
  const navigate = useNavigate();
  const { createReservation, loading: creatingReservation, error } = useCreateReservation();

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

  const handleInputChange = (field) => (event) => {
    handleFormChange(field, event.target.value);
    if (authError) setAuthError('');
  };

  const handleFechaChange = (event) => {
    const fecha = event.target.value;
    handleFormChange('fechaInicio', fecha);
  };

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

  const steps = [
    { number: 1, title: showLogin ? "Inicio de sesión" : "Registro", completed: currentStep > 1 },
    { number: 2, title: "Información Personal", completed: currentStep > 2 },
    { number: 3, title: "Fecha de Inicio", completed: currentStep > 3 },
    { number: 4, title: "Servicios y Confirmación", completed: currentStep > 4 },
  ];

  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'NIT', label: 'NIT (Persona Jurídica)' }
  ];

  // Manejo de login
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

  // Manejo de registro
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

    console.log('🚀 Confirmando reserva con datos:', {
      ...reservationData,
      ...formData
    });

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
      navigate('/reserva-confirmada', {
        state: {
          reserva: result.reserva,
          message: result.message
        }
      });
    } else {
      setAuthError(`Error creando la reserva: ${result.error}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? "bg-[#4B799B] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.completed ? "✓" : step.number}
              </div>
              <div 
                className={`mt-2 text-xs text-center w-full ${
                  currentStep === step.number 
                    ? "text-[#4B799B] font-medium" 
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-20 mx-2 self-center ${
                    currentStep > step.number ? "bg-[#4B799B]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-[#2C3A61]">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>
      </div>

      {/* Mensaje de error/auth */}
      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {authError}
        </div>
      )}

      {/* Step Content */}
      <div className="mb-6">
        {/* PASO 1: Autenticación */}
        {currentStep === 1 && (
          <div>
            {user ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium">¡Ya estás logueado!</p>
                    <p className="text-green-600 text-sm">
                      Conectado como: {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#4B799B] text-white px-4 py-2 rounded-md hover:bg-[#3b5f7a] transition"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!showLogin ? (
                  <form onSubmit={handleRegisterSubmit} className="bg-gray-50 p-4 rounded-lg shadow w-full">
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Nombre</label>
                      <input
                        type="text"
                        value={formData.nombre || ""}
                        onChange={handleInputChange('nombre')}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Contraseña</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        disabled={loading}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#4B799B] text-white py-2 rounded-md font-semibold hover:bg-[#3b5f7a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Registrando...
                        </div>
                      ) : (
                        'Registrarse'
                      )}
                    </button>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="text-[#4B799B] hover:underline font-medium"
                        onClick={() => setShowLogin(true)}
                        disabled={loading}
                      >
                        Ya tengo cuenta
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLoginSubmit} className="bg-gray-50 p-4 rounded-lg shadow w-full">
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Contraseña</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        disabled={loading}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#4B799B] text-white py-2 rounded-md font-semibold hover:bg-[#3b5f7a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Iniciando sesión...
                        </div>
                      ) : (
                        'Iniciar sesión'
                      )}
                    </button>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="text-[#4B799B] hover:underline font-medium"
                        onClick={() => setShowLogin(false)}
                        disabled={loading}
                      >
                        Quiero registrarme
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* PASO 2: Información Personal */}
        {currentStep === 2 && (
          <div>
            <p className="text-sm text-[#2C3A61] mb-4">
              Completa tu información personal para continuar:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
                  Tipo de documento *
                </label>
                <select
                  value={formData.tipoDocumento}
                  onChange={handleInputChange('tipoDocumento')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="">Selecciona un tipo de documento</option>
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
                  Número de documento *
                </label>
                <input
                  type="text"
                  value={formData.numeroDocumento}
                  onChange={handleInputChange('numeroDocumento')}
                  placeholder="Ingresa tu número de documento"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
                  Número de celular *
                </label>
                <input
                  type="tel"
                  value={formData.numeroCelular}
                  onChange={handleInputChange('numeroCelular')}
                  placeholder="Ej: 3001234567"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: Fecha de Inicio */}
        {currentStep === 3 && (
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
                  Selecciona la fecha de inicio: *
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={handleFechaChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 4: Servicios y Confirmación */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
                Selecciona servicios adicionales (opcional):
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Seguro", "Transporte", "Acceso 24/7", "Alarma", "CCTV"].map((servicio) => (
                  <button
                    key={servicio}
                    type="button"
                    className={`px-4 py-2 rounded-full border font-medium transition
                      ${formData.servicios.includes(servicio)
                        ? "bg-[#4B799B] text-white border-[#4B799B]"
                        : "bg-white text-[#2C3A61] border-gray-300 hover:bg-gray-100"}`}
                    onClick={() => {
                      const servicios = formData.servicios.includes(servicio)
                        ? formData.servicios.filter(s => s !== servicio)
                        : [...formData.servicios, servicio];
                      handleFormChange("servicios", servicios);
                    }}
                  >
                    {servicio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen de datos */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-800">Resumen de tu reserva:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Documento:</span>
                  <p className="text-gray-600">{formData.tipoDocumento} {formData.numeroDocumento}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Celular:</span>
                  <p className="text-gray-600">{formData.numeroCelular}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fecha inicio:</span>
                  <p className="text-gray-600">
                    {formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString('es-ES') : 'Sin fecha'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Servicios:</span>
                  <p className="text-gray-600">
                    {formData.servicios?.length > 0 ? formData.servicios.join(', ') : 'Ninguno'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información importante:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Tu solicitud será enviada a la empresa para aprobación</li>
                <li>• Recibirás una notificación cuando sea aceptada o rechazada</li>
                <li>• El pago se realizará una vez aprobada la reserva</li>
                <li>• Puedes cancelar la reserva antes de que sea aceptada</li>
              </ul>
            </div>

            {/* Error de reserva */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">❌ {error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons - SOLO UN SET DE BOTONES */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-md ${
            currentStep === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          Anterior
        </button>

        {currentStep === 4 ? (
          <button
            onClick={handleConfirmReservation}
            disabled={creatingReservation}
            className="px-6 py-2 bg-[#2C3A61] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creatingReservation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando reserva...
              </>
            ) : (
              <>
                🎉 Confirmar Reserva
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-[#4B799B] text-white rounded-md hover:bg-[#3b5f7a] transition"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );  
}