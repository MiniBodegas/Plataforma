export function DateSelectionStep({ fechaInicio, handleFechaChange }) {
  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
            Selecciona la fecha de inicio: *
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={handleFechaChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            style={{ colorScheme: 'light' }}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>
    </div>
  );
}