import React from 'react';

export function PersonalInfoStep({ formData, handleInputChange }) {
  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'NIT', label: 'NIT (Persona Jurídica)' }
  ];

  return (
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
  );
}