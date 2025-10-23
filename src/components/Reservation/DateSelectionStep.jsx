import { useState } from "react";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function DateSelectionStep({
  fechaInicio,
  handleFechaChange,
  reservas = [],
  totalBodegas = 1,
  empresaId,
  bodegaId
}) {
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

  // Debug: Ver todas las reservas que llegan al componente
  console.log("Todas las reservas recibidas:", reservas);
  console.log("bodegaId recibido:", bodegaId, "empresaId recibido:", empresaId);

  // 1. Filtra reservas activas de la bodega y empresa
  const reservasFiltradas = reservas.filter(r =>
    r.estado === "aceptada" &&
    (!empresaId || r.empresa_id === empresaId) &&
    (!bodegaId || r.mini_bodega_id === bodegaId)
  );

  // Debug: Ver reservas filtradas por bodega y empresa
  console.log("Reservas filtradas:", reservasFiltradas.map(r => ({
    id: r.id,
    mini_bodega_id: r.mini_bodega_id,
    empresa_id: r.empresa_id,
    estado: r.estado,
    fecha_inicio: r.fecha_inicio,
    fecha_fin: r.fecha_fin
  })));

  // 2. Cuenta cuántas reservas activas indefinidas hay (sin fecha_fin)
  const reservasIndefinidas = reservasFiltradas.filter(r => !r.fecha_fin);

  // 3. Si el número de reservas indefinidas es igual o mayor al total de bodegas, bloquear todo el calendario
  const bloquearTodo = reservasIndefinidas.length >= totalBodegas;

  // 4. Si no, bloquear solo los días reservados (por fecha_inicio y fecha_fin si existiera)
  const reservasPorFecha = reservasFiltradas.reduce((acc, r) => {
    // Si la reserva es indefinida, marca todos los días desde fecha_inicio en adelante como ocupados
    if (!r.fecha_fin) {
      // No hacemos nada aquí, ya que bloquearTodo será true y bloqueará todo el calendario
    } else {
      // Si tiene fecha_fin, marca el rango como ocupado
      let inicio = new Date(r.fecha_inicio);
      let fin = new Date(r.fecha_fin);
      while (inicio <= fin) {
        const yyyy = inicio.getFullYear();
        const mm = String(inicio.getMonth() + 1).padStart(2, "0");
        const dd = String(inicio.getDate()).padStart(2, "0");
        const localDateString = `${yyyy}-${mm}-${dd}`;
        acc[localDateString] = (acc[localDateString] || 0) + 1;
        inicio.setDate(inicio.getDate() + 1);
      }
    }
    return acc;
  }, {});

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
            date.setHours(0, 0, 0, 0);

            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const localDateString = `${yyyy}-${mm}-${dd}`;

            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isPast = date < today;

            // Bloquear todos los días desde la fecha_inicio de una reserva aceptada indefinida
            const indefinida = reservasFiltradas.find(r => r.estado === "aceptada" && !r.fecha_fin);
            let bloquearPorIndefinida = false;
            if (indefinida) {
              const inicio = new Date(indefinida.fecha_inicio);
              inicio.setHours(0, 0, 0, 0);
              if (date >= inicio) {
                bloquearPorIndefinida = true;
              }
            }

            // Si bloquearTodo es true, bloquea todos los días futuros
            if ((bloquearTodo && date >= today) || bloquearPorIndefinida) {
              return (
                <button
                  key={day}
                  className={`w-8 h-8 rounded-full text-gray-300 cursor-not-allowed bg-gray-100`}
                  disabled
                  title="Sin bodegas disponibles"
                >
                  {day}
                </button>
              );
            }

            // Si no, bloquea solo los días donde el número de reservas alcanza el total de bodegas
            const reservasEnDia = reservasPorFecha[localDateString] || 0;
            const isFull = reservasEnDia >= totalBodegas;

            return (
              <button
                key={day}
                className={`w-8 h-8 rounded-full transition
                  ${isSelected ? "bg-[#4B799B] text-white font-bold" : ""}
                  ${isToday && !isSelected ? "border border-[#4B799B]" : ""}
                  ${(isPast || isFull) ? "text-gray-300 cursor-not-allowed bg-gray-100" : "hover:bg-[#e6f0fa]"}
                `}
                disabled={isPast || isFull}
                onClick={() => handleDayClick(day)}
                type="button"
                title={isFull ? "Sin bodegas disponibles" : undefined}
              >
                {day}
              </button>
            );
          })}
      </div>
    </div>
  );
}