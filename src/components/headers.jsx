import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Plataforma de
              <br />
              mini bodegas
            </h1>
          </div>
          <nav className="flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Calcula tu espacio
            </a>
            <Button variant="outline">Regístrate</Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
