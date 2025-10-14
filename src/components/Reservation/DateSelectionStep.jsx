import { useState } from "react";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function DateSelectionStep({ fechaInicio, handleFechaChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Solo una vez aquí
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const selectedDate = fechaInicio
    ? new Date(
        Number(fechaInicio.slice(0, 4)),
        Number(fechaInicio.slice(5, 7)) - 1,
        Number(fechaInicio.slice(8, 10))
      )
    : null;

  const handleDayClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const localDateString = `${yyyy}-${mm}-${dd}`;
    handleFechaChange({
      target: {
        value: localDateString,
      },
    });
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="max-w-xs mx-auto bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="text-[#4B799B] hover:text-[#2C3A61] px-2 py-1 rounded transition"
        >
          &lt;
        </button>
        <span className="font-semibold text-[#2C3A61]">
          {new Date(currentYear, currentMonth)
            .toLocaleString("es-CO", { month: "long", year: "numeric" })
            .replace(/^./, (c) => c.toUpperCase())}
        </span>
        <button
          onClick={nextMonth}
          className="text-[#4B799B] hover:text-[#2C3A61] px-2 py-1 rounded transition"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="font-medium text-[#4B799B]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        {Array(daysInMonth)
          .fill(null)
          .map((_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            date.setHours(0, 0, 0, 0); // Normaliza la hora

            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isPast = date < today;

            return (
              <button
                key={day}
                className={`w-8 h-8 rounded-full transition
                  ${isSelected ? "bg-[#4B799B] text-white font-bold" : ""}
                  ${isToday && !isSelected ? "border border-[#4B799B]" : ""}
                  ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-[#e6f0fa]"} 
                `}
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                type="button"
              >
                {day}
              </button>
            );
          })}
      </div>
    </div>
  );
}

// Utilidad para comparar fechas (ignora hora)
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}