import WarehouseCard from "./WarehouseCard"

export function WarehouseGrid({ warehouses = [] }) {
  if (warehouses.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        No se encontraron bodegas disponibles
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {warehouses.map((warehouse) => (
        <WarehouseCard key={warehouse.id} warehouse={warehouse} />
      ))}
    </div>
  )
}

export default WarehouseGrid
