import { Instagram, Facebook, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Plataforma de mini bodegas</h3>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <Facebook className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <MessageCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Enlaces útiles</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Calcula tu espacio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Regístrate como proveedor
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Contacto</h4>
            <p className="text-gray-600">minibodegas@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer;
