"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export function FAQCards() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "¿Tiene costo publicar mis mini bodegas?",
      answer: "No, el registro es gratuito, solo cobramos comisión cuando recibes tu primera mensualidad.",
    },
    {
      question: "¿Puedo registrar varias sedes?",
      answer: "Sí, puedes registrar múltiples ubicaciones en nuestra plataforma.",
    },
    {
      question: "¿Cómo funciona el pago?",
      answer: "Los pagos se procesan de forma segura a través de nuestra plataforma.",
    },
    {
      question: "¿Qué pasa si una bodega ya no está disponible?",
      answer: "Te notificaremos inmediatamente y te ayudaremos a encontrar alternativas.",
    },
    {
      question: "¿La plataforma valida a los usuarios antes de reservar?",
      answer: "Sí, todos los usuarios pasan por un proceso de verificación.",
    },
    {
      question: "¿Puedo actualizar la disponibilidad en tiempo real?",
      answer: "Sí, puedes actualizar la disponibilidad desde tu panel de control.",
    },
    {
      question: "¿Cómo me entero de una nueva reserva?",
      answer: "Recibirás notificaciones por email y en la aplicación.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 " style={{ color: "#2C3A61" }}>Preguntas frecuentes (FAQ)</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm" >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-blue-100 transition-colors duration-200"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900" style={{ color: "#2C3A61" }}>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600" style={{ color: "#2C3A61" }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
