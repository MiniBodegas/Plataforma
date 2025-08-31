import { Link } from "react-router-dom"

export function HeroSectionProveedor() {
  return (
    <section className="bg-white flex justify-center items-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gray-50 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px]">
            
            {/* Columna de textos */}
            <div className="text-left flex flex-col justify-center">
              <h2 
                className="text-3xl font-bold mb-4" 
                style={{ color: "#2C3A61" }}
              >
                Conecta tus mini
                <br />
                bodegas con clientes
                <br />
                Listos para reservar
              </h2>
              <p 
                className="mb-6" 
                style={{ color: "#2C3A61" }}
              >
                Publica hoy y empieza a recibir ingresos mañana.
                <br />
                Únete a la plataforma que conecta a personas y empresas 
                con espacios de almacenamiento de forma rápida y segura. 
              </p>

              <div className="flex gap-2">
                <Link to="/planes">
                  <button 
                    className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-4 py-2 rounded-[10px] transition-colors"
                  >
                    Quiero registrar mis mini bodegas
                  </button>
                </Link>
              </div>
            </div>

            {/* Columna de imagen */}
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8b2ZmaWNlfGVufDB8MXwwfHx8Mg%3D%3D"
                alt="Persona relajándose"
                className="rounded-lg shadow-lg max-w-xs h-auto object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
