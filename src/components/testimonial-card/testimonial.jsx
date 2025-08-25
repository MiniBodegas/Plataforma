import { Star } from "lucide-react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import './testimonial.css'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Juan Esteban Ramirez",
      text: "La mejor plataforma para contratar servicios de mini bodegas.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "María López",
      text: "Excelente servicio, muy rápido y confiable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Carlos Gómez",
      text: "Nunca había tenido una experiencia tan sencilla al contratar.",
      rating: 4,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Ana Torres",
      text: "Lo recomiendo al 100%, solucionó mi problema de espacio.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Pedro Martínez",
      text: "Fácil de usar y con muy buena atención al cliente.",
      rating: 4,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBvcnRyYWl0fGVufDB8MXwwfHx8Mg%3D%3D",
    },
  ]

  const settings = {
    dots: false,
    infinite: true,
    speed: 900,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-8xl mx-auto px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ color: "#2C3A61" }}>
          Testimonios
        </h2>

        {/* Padding horizontal del carrusel → controla el espacio entre el borde de la sección y las cards */}
        <Slider {...settings} className="px-20">
          {testimonials.map((testimonial, index) => (
            // px-4 controla el espacio ENTRE cada card
            <div key={index} className="px-4 h-full"> 
              {/* Card principal */}
              <div 
                className="
                  bg-white rounded-2xl shadow-md 
                  flex flex-col justify-between 
                  h-[160px]
                  mx-auto  
                  transition-transform hover:scale-[1.03] 
                  hover:shadow-lg duration-300 ease-in-out
                "
              >
                {/* Header de la card (imagen + nombre + estrellas) */}
                <div className="flex items-center gap-3 px-8 pt-8"> 
                  {/* px-4 y pt-4 dan padding SOLO arriba e izquierda */}
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900" style={{ color: "#2C3A61" }}>
                      {testimonial.name}
                    </h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Texto del testimonio */}
                <p className="text-gray-600 italic text-sm leading-relaxed px-4 pb-4" style={{ color: "#2C3A61" }}>
                  "{testimonial.text}"
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  )
}
