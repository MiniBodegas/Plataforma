import { Planes } from '../../components'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export function PlanesScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [empresaId, setEmpresaId] = useState('')

  useEffect(() => {
    const fetchEmpresaId = async () => {
      const { data } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', '1')
      if (data && data.length > 0) {
        setEmpresaId(data[0].id)
      }
    }
    fetchEmpresaId()
  }, [])

  const navigate = useNavigate(); // Usa el hook aquí

  const handleObtener = async (planKey) => {
    setLoading(true)
    setError('')
    try {
      if (!empresaId) {
        setError("No se encontró la empresa.")
        setLoading(false)
        return
      }
      // Actualiza el plan en la empresa
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ plan: planKey })
        .eq("id", empresaId)

      if (updateError) {
        setError("No se pudo guardar el plan. Intenta de nuevo.")
        setLoading(false)
        return
      }
      // Avanza solo si se guardó correctamente
      navigate("/completar-formulario-proveedor")
    } catch (err) {
      setError("Error inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-[#2C3A61] mb-6">
        Planes
      </h1>
      <Planes />
    </div>
  );
}
