export function PopUp({ onClose, bodegaData }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-2xl text-center relative">
        <div className="absolute top-3 right-3">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias por tu reserva!</h3>
        <p className="text-gray-600 mb-4">
          En los siguientes días te informaremos si tu solicitud fue aceptada. 
          Gracias por confiar en nosotros.
        </p>
        
        <div className="mt-6">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#4B799B] text-white rounded-lg font-medium hover:bg-[#3b5f7a] transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}