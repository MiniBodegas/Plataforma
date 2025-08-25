import { WarehouseCard } from './warehouseCard'

export function WarehouseGrid({ warehouses = [] }) {
  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay bodegas disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {warehouses.map((warehouse) => (
        <WarehouseCard 
          key={warehouse.id} 
          warehouse={warehouse} 
        />
      ))}
    </div>
  )
}

export default WarehouseGrid  