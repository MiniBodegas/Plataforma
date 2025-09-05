import React, { useState, useRef, useEffect } from "react";
/* -------------------------------------------
 📦 CATÁLOGO DE ARTÍCULOS
------------------------------------------- */
const ITEM_CATALOG = [
  // Habitación (con opción desmontable)
  { id: 1, category: "Habitación", name: "Cama individual", volume: 0.6, altVolume: 0.24 },
  { id: 2, category: "Habitación", name: "Cama semidoble", volume: 0.72, altVolume: 0.288 },
  { id: 3, category: "Habitación", name: "Cama doble", volume: 0.98, altVolume: 0.392 },
  { id: 4, category: "Habitación", name: "Colchón individual", volume: 0.4 },
  { id: 5, category: "Habitación", name: "Colchón semidoble", volume: 0.48 },
  { id: 6, category: "Habitación", name: "Colchón doble", volume: 0.7 },
  { id: 7, category: "Habitación", name: "Mesa de noche", volume: 0.096 },
  { id: 8, category: "Habitación", name: "Tocador", volume: 0.432 },
  { id: 9, category: "Habitación", name: "Lámpara de mesa", volume: 0.016 },
  { id: 10, category: "Habitación", name: "Espejo", volume: 0.025 },
  { id: 11, category: "Habitación", name: "Cómoda / Cajonera", volume: 0.225 },
  { id: 12, category: "Habitación", name: "Armario", volume: 1.08 },
  { id: 13, category: "Habitación", name: "Cuna", volume: 0.54 },
  // Sala / Comedor
  { id: 14, category: "Sala / Comedor", name: "Silla comedor", volume: 0.182 },
  { id: 15, category: "Sala / Comedor", name: "Silla de bar", volume: 0.203 },
  { id: 16, category: "Sala / Comedor", name: "Sillón / Poltrona", volume: 0.576 },
  { id: 17, category: "Sala / Comedor", name: "Mecedora", volume: 0.49 },
  { id: 18, category: "Sala / Comedor", name: "Reclinable", volume: 1.0 },
  { id: 19, category: "Sala / Comedor", name: "Puff", volume: 0.091 },
  { id: 20, category: "Sala / Comedor", name: "Sofá 2 puestos", volume: 1.218 },
  { id: 21, category: "Sala / Comedor", name: "Sofá 3 puestos", volume: 1.62 },
  { id: 22, category: "Sala / Comedor", name: "Sofá en L", volume: 2.7 },
  { id: 23, category: "Sala / Comedor", name: "Mesa comedor 4 puestos", volume: 0.675 },
  { id: 24, category: "Sala / Comedor", name: "Mesa comedor 6 puestos", volume: 1.08 },
  { id: 25, category: "Sala / Comedor", name: "Mesa comedor 8 puestos", volume: 1.5 },
  { id: 26, category: "Sala / Comedor", name: "Mesa centro", volume: 0.182 },
  { id: 27, category: "Sala / Comedor", name: "Mesa auxiliar", volume: 0.125 },
  { id: 28, category: "Sala / Comedor", name: "Banca comedor", volume: 0.243 },
  { id: 29, category: "Sala / Comedor", name: "Vitrina / Buffet", volume: 0.72 },
  { id: 30, category: "Sala / Comedor", name: "Gabinete", volume: 0.576 },
  { id: 31, category: "Sala / Comedor", name: "Librería", volume: 0.432 },
  { id: 32, category: "Sala / Comedor", name: "Mueble TV", volume: 0.36 },
  { id: 33, category: "Sala / Comedor", name: "Alfombra enrollada", volume: 0.08 },
  // Electrodomésticos
  { id: 34, category: "Electrodomésticos", name: "Televisor", volume: 0.15 },
  { id: 35, category: "Electrodomésticos", name: "Aire acondicionado ventana", volume: 0.058 },
  { id: 36, category: "Electrodomésticos", name: "Mini split", volume: 0.048 },
  { id: 37, category: "Electrodomésticos", name: "Lavadora", volume: 0.306 },
  { id: 38, category: "Electrodomésticos", name: "Secadora", volume: 0.306 },
  { id: 39, category: "Electrodomésticos", name: "Lavavajillas", volume: 0.306 },
  { id: 40, category: "Electrodomésticos", name: "Nevera", volume: 0.833 },
  { id: 41, category: "Electrodomésticos", name: "Nevecon", volume: 1.134 },
  { id: 42, category: "Electrodomésticos", name: "Estufa", volume: 0.405 },
  { id: 43, category: "Electrodomésticos", name: "Microondas", volume: 0.077 },
  { id: 44, category: "Electrodomésticos", name: "Horno pequeño", volume: 0.124 },
  { id: 45, category: "Electrodomésticos", name: "Ventilador pedestal", volume: 0.3 },
  { id: 46, category: "Electrodomésticos", name: "Cafetera", volume: 0.022 },
  // Oficina
  { id: 47, category: "Oficina", name: "Silla de oficina", volume: 0.465 },
  { id: 48, category: "Oficina", name: "Escritorio", volume: 0.54 },
  { id: 49, category: "Oficina", name: "Mesa de trabajo", volume: 0.844 },
  { id: 50, category: "Oficina", name: "Archivador", volume: 0.27 },
  { id: 51, category: "Oficina", name: "Escritorio en L", volume: 1.125 },
  { id: 52, category: "Oficina", name: "Monitor", volume: 0.06 },
  { id: 53, category: "Oficina", name: "Gabinete", volume: 0.576 },
  { id: 54, category: "Oficina", name: "Impresora", volume: 0.071 },
  // Cajas y otros
  { id: 55, category: "Cajas y otros", name: "Caja pequeña", volume: 0.027 },
  { id: 56, category: "Cajas y otros", name: "Caja mediana", volume: 0.091 },
  { id: 57, category: "Cajas y otros", name: "Caja grande", volume: 0.216 },
  { id: 58, category: "Cajas y otros", name: "Maleta de mano (19kg)", volume: 0.044 },
  { id: 59, category: "Cajas y otros", name: "Maleta grande (23kg)", volume: 0.113 },
  { id: 60, category: "Cajas y otros", name: "Asador", volume: 0.36 },
  { id: 61, category: "Cajas y otros", name: "Asador de barril", volume: 0.25 },
  { id: 62, category: "Cajas y otros", name: "Escalera plegable", volume: 0.15 },
  { id: 63, category: "Cajas y otros", name: "Caminadora", volume: 0.294 },
  { id: 64, category: "Cajas y otros", name: "Bicicleta estática", volume: 0.72 },
  { id: 65, category: "Cajas y otros", name: "Bicicleta", volume: 0.54 },
  { id: 66, category: "Cajas y otros", name: "Bicicleta de niño", volume: 0.231},
  { id: 67, category: "Cajas y otros", name: "Carrito de bebé", volume: 0.18 },
  // Combos
  { id: 68, category: "Combos", name: "Juego de sala", volume: 2.166 },
  { id: 69, category: "Combos", name: "Juego de comedor", volume: 2.172 },
  { id: 70, category: "Combos", name: "Habitación completa", volume: 1.74 },
  { id: 71, category: "Combos", name: "Kit oficina", volume: 2.013 },
];
const getPricing = (v) =>
  v === 0 ? { storage: 0 } : PRICING_TABLE.find((r) => v <= r.maxVolume) || PRICING_TABLE.at(-1);

export function Calculadora() {
  const [selectedCategory, setSelectedCategory] = useState("Habitación");
  const [quantities, setQuantities] = useState({});
  const [disassembled, setDisassembled] = useState({});
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Sugerencias de búsqueda
  const suggestions = ITEM_CATALOG.filter(
    (it) => it.name.toLowerCase().includes(search.toLowerCase()) && search.trim()
  );
  useEffect(() => {
    const handler = (e) =>
      inputRef.current && !inputRef.current.contains(e.target) && setShowSuggestions(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Artículo personalizado
  const [custom, setCustom] = useState({ name: "", h: "", w: "", d: "" });
  const addCustomItem = () => {
    const { name, h, w, d } = custom;
    if (!name || !h || !w || !d) return alert("Completa todos los campos");
    const volume = ((h * w * d) / 1_000_000).toFixed(2); // cm³ → m³
    const newId = ITEM_CATALOG.length + 1;
    const newItem = {
      id: newId,
      category: "Personalizado",
      name,
      volume: Number(volume),
    };
    ITEM_CATALOG.push(newItem);
    setQuantities((q) => ({ ...q, [newId]: 1 }));
    setCustom({ name: "", h: "", w: "", d: "" });
  };

  // Helpers
  const itemVol = (item) => (disassembled[item.id] && item.altVolume ? item.altVolume : item.volume);
  const calcVolume = () =>
    Object.entries(quantities).reduce(
      (sum, [id, qty]) => sum + itemVol(ITEM_CATALOG.find((i) => i.id === Number(id))) * qty,
      0
    );

  // Handlers
  const updateQty = (id, delta) => {
    setQuantities((prev) => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === cur) return prev;
      const n = { ...prev };
      next ? (n[id] = next) : delete n[id];
      return n;
    });
  };
  const toggleDisassembled = (id) => setDisassembled((d) => ({ ...d, [id]: !d[id] }));
  const clearAll = () => {
    setQuantities({});
    setDisassembled({});
  };

  // Cálculos
  const totalVolume = calcVolume();
  const itemsWithQty = ITEM_CATALOG.filter((i) => quantities[i.id]).map((i) => ({
    ...i,
    qty: quantities[i.id],
  }));

  /* ------------------------------------------- UI ------------------------------------------- */
  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 min-h-screen bg-white text-sm">
      {/* CATÁLOGO */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-6 text-center">Catálogo de artículos</h2>

        {/* Input búsqueda */}
        <div className="relative mb-4" ref={inputRef}>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar artículo..."
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-400"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 bg-white border rounded-xl shadow max-h-40 overflow-y-auto text-sm">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(s.category);
                    setSearch("");
                    setShowSuggestions(false);
                  }}
                >
                  {s.name} <span className="text-gray-400">({s.category})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filtros categorías */}
        <div className="mb-5 flex flex-wrap gap-2 justify-center">
          {[...new Set(ITEM_CATALOG.map((i) => i.category))].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-y">
            <tr>
              <th className="py-2">Artículo</th>
              <th>m³</th>
              <th className="text-center">Desmontable</th>
              <th className="text-center">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {ITEM_CATALOG.filter((i) => i.category === selectedCategory).map((it) => (
              <tr key={it.id} className="border-t hover:bg-gray-50 transition">
                <td className="py-2">{it.name}</td>
                <td>{itemVol(it).toFixed(2)}</td>
                <td className="text-center">
                  {it.altVolume && (
                    <input
                      type="checkbox"
                      checked={disassembled[it.id] || false}
                      onChange={() => toggleDisassembled(it.id)}
                    />
                  )}
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateQty(it.id, -1)}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span>{quantities[it.id] || 0}</span>
                    <button
                      onClick={() => updateQty(it.id, 1)}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🟦 RESUMEN */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-2xl shadow-md p-6 sticky top-6 h-fit">
        <h2 className="text-xl font-bold text-blue-900 mb-6 text-center">Resumen de tu mudanza</h2>

        {/* Resumen items */}
        <div className="mb-4 max-h-40 overflow-y-auto text-sm">
          {itemsWithQty.length === 0 ? (
            <p className="text-gray-400">No has agregado artículos</p>
          ) : (
            <ul className="space-y-1">
              {itemsWithQty.map((it) => (
                <li key={it.id}>
                  {it.name} × {it.qty} = {(itemVol(it) * it.qty).toFixed(2)} m³
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Total volumen */}
        <p className="font-medium mb-2">Volumen total: {totalVolume.toFixed(2)} m³</p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={clearAll}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Limpiar
          </button>
          <button className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            Continuar
          </button>
        </div>

        {/* ➕ Personalizado */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2 text-sm text-blue-900">Agregar artículo personalizado</h3>
          <div className="space-y-2">
            <input
              value={custom.name}
              onChange={(e) => setCustom({ ...custom, name: e.target.value })}
              placeholder="Nombre del artículo"
              className="w-full border rounded-xl px-3 py-1 bg-white text-black placeholder-gray-400"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={custom.h}
                onChange={(e) => setCustom({ ...custom, h: e.target.value })}
                placeholder="Alto (cm)"
                className="w-full border rounded-xl px-3 py-1 bg-white text-black placeholder-gray-400"
              />
              <input
                type="number"
                value={custom.w}
                onChange={(e) => setCustom({ ...custom, w: e.target.value })}
                placeholder="Ancho (cm)"
                className="w-full border rounded-xl px-3 py-1 bg-white text-black placeholder-gray-400"
              />
              <input
                type="number"
                value={custom.d}
                onChange={(e) => setCustom({ ...custom, d: e.target.value })}
                placeholder="Prof (cm)"
                className="w-full border rounded-xl px-3 py-1 bg-white text-black placeholder-gray-400"
              />
            </div>
            <button
              onClick={addCustomItem}
              className="w-full px-3 py-1 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}