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

/* -------------------------------------------
 💰 TABLA DE PRECIOS POR VOLUMEN (m³)
------------------------------------------- */
const PRICING_TABLE = [
  { maxVolume: 0.5, storage: 44000, packing: 13000, transport: 19000 },
  { maxVolume: 1, storage: 80900, packing: 23600, transport: 35400 },
  { maxVolume: 2, storage: 147000, packing: 42900, transport: 64300 },
  { maxVolume: 3, storage: 200400, packing: 58500, transport: 87700 },
  { maxVolume: 4, storage: 242900, packing: 70900, transport: 106300 },
  { maxVolume: 5, storage: 276000, packing: 80600, transport: 120800 },
  { maxVolume: 6, storage: 301100, packing: 87900, transport: 131800 },
  { maxVolume: 7, storage: 319400, packing: 93200, transport: 139800 },
  { maxVolume: 8, storage: 331800, packing: 96800, transport: 145200 },
  { maxVolume: 9, storage: 339300, packing: 99000, transport: 148500 },
  { maxVolume: 10, storage: 342700, packing: 100000, transport: 150000 },
];

const MAX_VOLUME = 10;
const getPricing = (v) =>
  v === 0
    ? { storage: 0, packing: 0, transport: 0 }
    : PRICING_TABLE.find((r) => v <= r.maxVolume) || PRICING_TABLE.at(-1);

export function Calculadora() {
  /* ---------- estados ---------- */
  const [selectedCategory, setSelectedCategory] = useState("Habitación");
  const [quantities, setQuantities] = useState({});
  const [disassembled, setDisassembled] = useState({});
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [includePacking, setIncludePacking] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);
  const inputRef = useRef(null);

  /* ---------- búsqueda ---------- */
  const suggestions = ITEM_CATALOG.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) && search.trim()
  );
  useEffect(() => {
    const handler = (e) =>
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      setShowSuggestions(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* --- 2️⃣  OBJETO PERSONALIZADO --- */
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
    ITEM_CATALOG.push(newItem); // se agrega al catálogo
    setQuantities((q) => ({ ...q, [newId]: 1 }));
    setCustom({ name: "", h: "", w: "", d: "" });
  };

  /* ---------- helpers ---------- */
  const itemVol = (item) =>
    disassembled[item.id] && item.altVolume ? item.altVolume : item.volume;
  const calcVolume = () =>
    Object.entries(quantities).reduce(
      (sum, [id, qty]) =>
        sum + itemVol(ITEM_CATALOG.find((i) => i.id === Number(id))) * qty,
      0
    );

  /* ---------- handlers ---------- */
  const updateQty = (id, delta) => {
    setQuantities((prev) => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === cur) return prev;
      const projected =
        calcVolume() +
        (next - cur) * itemVol(ITEM_CATALOG.find((i) => i.id === id));
      if (projected > MAX_VOLUME) {
        alert("⚠️ El volumen total no puede superar 10 m³");
        return prev;
      }
      const n = { ...prev };
      next ? (n[id] = next) : delete n[id];
      return n;
    });
  };
  const toggleDisassembled = (id) =>
    setDisassembled((d) => ({ ...d, [id]: !d[id] }));
  const clearAll = () => {
    setQuantities({});
    setDisassembled({});
  };

  /* ---------- cálculos ---------- */
  const totalVolume = calcVolume();
  const { storage, packing, transport } = getPricing(totalVolume);
  const packingCost = includePacking ? packing : 0;
  const transportCost = includeTransport ? transport : 0;
  const total = storage + packingCost + transportCost;
  const itemsWithQty = ITEM_CATALOG
    .filter((i) => quantities[i.id])
    .map((i) => ({ ...i, qty: quantities[i.id] }));

  /* ------------------------------------------- UI ------------------------------------------- */
  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 min-h-screen bg-white text-sm">
      {/* CATÁLOGO */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-6 text-center">
          Catálogo de artículos
        </h2>

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
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {s.name}{" "}
                  <span className="text-gray-400">({s.category})</span>
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
            {ITEM_CATALOG.filter((i) => i.category === selectedCategory).map(
              (it) => (
                <tr
                  key={it.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 pr-2">{it.name}</td>
                  <td>{itemVol(it).toFixed(2)}</td>
                  <td className="text-center">
                    {it.altVolume && (
                      <input
                        type="checkbox"
                        checked={!!disassembled[it.id]}
                        onChange={() => toggleDisassembled(it.id)}
                      />
                    )}
                  </td>
                  <td className="flex items-center justify-center gap-2 py-2">
                    <button
                      className="px-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      onClick={() => updateQty(it.id, -1)}
                    >
                      –
                    </button>
                    <span className="w-6 text-center">
                      {quantities[it.id] || 0}
                    </span>
                    <button
                      className="px-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => updateQty(it.id, 1)}
                    >
                      +
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* RESUMEN */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-2xl shadow-md p-6 gap-6">
        <h2 className="text-xl font-bold text-blue-900 text-center">
          Resumen
        </h2>

        {/* Artículos seleccionados */}
        <div>
          <h3 className="font-semibold mb-2">Artículos seleccionados</h3>
          <ul className="flex-1 overflow-y-auto pr-2 text-sm space-y-2 max-h-40">
            {itemsWithQty.length === 0 && <li>No hay artículos.</li>}
            {itemsWithQty.map((it) => (
              <li
                key={it.id}
                className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <button
                    className="px-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    onClick={() => updateQty(it.id, -1)}
                  >
                    –
                  </button>
                  <span className="w-5 text-center">{it.qty}</span>
                  <button
                    className="px-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => updateQty(it.id, 1)}
                  >
                    +
                  </button>
                  <span className="pl-1">{it.name}</span>
                </span>
                <button
                  className="text-red-600 text-xs hover:underline"
                  onClick={() => updateQty(it.id, -it.qty)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          {itemsWithQty.length > 0 && (
            <button
              className="mt-2 w-full px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200"
              onClick={clearAll}
            >
              Eliminar todo
            </button>
          )}
        </div>

        {/* Custom item */}
        <div className="border p-4 rounded-xl space-y-2 bg-gray-50">
          <h3 className="font-semibold text-sm text-blue-900">
            Añadir objeto personalizado
          </h3>
          <input
            type="text"
            placeholder="Nombre"
            className="w-full border px-3 py-2 rounded text-sm"
            value={custom.name}
            onChange={(e) => setCustom({ ...custom, name: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            {["h", "w", "d"].map((k) => (
              <input
                key={k}
                type="number"
                min="1"
                placeholder={
                  k === "h"
                    ? "Alto (cm)"
                    : k === "w"
                    ? "Ancho (cm)"
                    : "Largo (cm)"
                }
                className="border px-2 py-1 rounded text-sm"
                value={custom[k]}
                onChange={(e) => setCustom({ ...custom, [k]: e.target.value })}
              />
            ))}
          </div>
          <button
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
            onClick={addCustomItem}
          >
            Agregar
          </button>
        </div>

        {/* Costos */}
        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span>Almacenamiento</span>
            <span>$ {storage.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePacking}
                onChange={() => setIncludePacking((p) => !p)}
              />
              Empaque
            </label>
            <span>$ {packingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTransport}
                onChange={() => setIncludeTransport((t) => !t)}
              />
              Transporte
            </label>
            <span>$ {transportCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Totales */}
        <div className="border-t pt-4 flex flex-col gap-2">
          <div className="flex justify-between font-semibold text-blue-700">
            <span>Total m³</span>
            <span>{totalVolume.toFixed(2)} m³</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total a pagar</span>
            <span>$ {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}