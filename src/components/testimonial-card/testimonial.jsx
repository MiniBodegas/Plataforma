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

  // Configuración solo para desktop
  const desktopSettings = {
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
        settings: { 
          slidesToShow: 2,
        },
      },
    ],
  }

  // Configuración solo para mobile
  const mobileSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  }

  // Componente de card reutilizable
  const TestimonialCard = ({ testimonial, isMobile = false }) => (
    <div className={`bg-white rounded-2xl shadow-md ${isMobile ? 'p-6 mx-4 min-h-[200px]' : 'p-4 mx-3 min-h-[180px]'} flex flex-col justify-between`}>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className={`rounded-full object-cover flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate ${isMobile ? 'text-base' : 'text-sm'}`} style={{ color: "#2C3A61" }}>
            {testimonial.name}
          </h4>
          <div className="flex mt-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className={`text-yellow-400 fill-current ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className={`italic leading-relaxed flex-1 ${isMobile ? 'text-sm' : 'text-xs'}`} style={{ color: "#2C3A61" }}>
        "{testimonial.text}"
      </p>
    </div>
  )

  return (
    <section className="py-20 bg-white">
      <div className="max-w-8xl mx-auto px-6 lg:px-12"> {/* Contenedor más grande y más padding */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ color: "#2C3A61" }}>
          Testimonios
        </h2>

        {/* VERSION DESKTOP (oculta en mobile) */}
        <div className="hidden md:block px-4 lg:px-8"> {/* Más padding horizontal en desktop */}
          <Slider {...desktopSettings}>
            {testimonials.map((testimonial, index) => (
              <div key={index}>
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </Slider>
        </div>

        {/* VERSION MOBILE (oculta en desktop) */}
        <div className="block md:hidden">
          <Slider {...mobileSettings}>
            {testimonials.map((testimonial, index) => (
              <div key={index}>
                <TestimonialCard testimonial={testimonial} isMobile={true} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  )
}
