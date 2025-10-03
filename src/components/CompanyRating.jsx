import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function CompanyRating({
  value = 0,
  onRate,
  reviewCount = 0,
  readOnly = false,
  user
}) {
  const [hovered, setHovered] = useState(null);
  const [localValue, setLocalValue] = useState(value);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClick = (val) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!readOnly) {
      setPendingValue(val);
      setShowPopup(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowPopup(false);
    setLocalValue(pendingValue);
    if (onRate) {
      await onRate(pendingValue, comment); // Pasa el comentario al handler
    }
    setComment('');
    setPendingValue(null);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setComment('');
    setPendingValue(null);
  };

  return (
    <div className="flex flex-col items-center mt-2 mb-2">
      <div className="flex flex-row gap-1">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            disabled={readOnly}
            aria-label={`Calificar con ${star} estrellas`}
            style={{ background: 'none', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer' }}
          >
            <svg
              width={28}
              height={28}
              className={`transition-colors duration-150 ${((hovered ?? localValue) >= star) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ display: 'inline' }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
            </svg>
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {reviewCount > 0
          ? `${value.toFixed(1)} / 5 · ${reviewCount} reseña${reviewCount > 1 ? 's' : ''}`
          : "Sin calificación"}
      </div>

      {/* Popup para comentario */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col"
            onSubmit={handleSubmit}
          >
            <h3 className="text-lg font-semibold mb-2 text-center">
              ¿Quieres dejar un comentario?
            </h3>
            <textarea
              className="border rounded p-2 mb-3 text-sm"
              placeholder="Escribe tu comentario (opcional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700"
              >
                Enviar
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-700 rounded px-3 py-1 hover:bg-gray-300"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
