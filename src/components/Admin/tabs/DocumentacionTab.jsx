import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import { useEmpresasDocumentacion } from '../../../hooks/useEmpresasDocumentacion';

export function DocumentacionTab() {
  const { documentacion, loading, actualizarEstadoVerificacion, loadDocumentacion } = useEmpresasDocumentacion();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  const handleVerDocumento = (url) => {
    window.open(url, '_blank');
  };

  const handleCambiarEstado = async (empresaId, nuevoEstado) => {
    console.log('🔵 handleCambiarEstado llamado con:', { empresaId, nuevoEstado });
    
    const result = await actualizarEstadoVerificacion(empresaId, nuevoEstado);
    
    console.log('🔵 Resultado de actualización:', result);
    
    if (result.success) {
      alert('Estado de verificación actualizado correctamente');
      // Cerrar modal y actualizar la empresa seleccionada
      setEmpresaSeleccionada(null);
    } else {
      alert('Error al actualizar estado: ' + result.error);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'verificado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'verificado':
        return <CheckCircle className="h-4 w-4" />;
      case 'rechazado':
        return <XCircle className="h-4 w-4" />;
      case 'pendiente':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#2C3A61] border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Cargando documentación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#2C3A61]">Documentación de Empresas</h3>
            <p className="text-sm text-gray-500 mt-1">
              Revisa y verifica la documentación de las empresas registradas
            </p>
          </div>
          <button
            onClick={loadDocumentacion}
            className="px-4 py-2 bg-[#2C3A61] text-white rounded-lg hover:bg-[#1f2942] transition"
          >
            Actualizar
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {documentacion.filter(d => d.estado_verificacion === 'pendiente').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-green-700">
                  {documentacion.filter(d => d.estado_verificacion === 'verificado').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rechazados</p>
                <p className="text-2xl font-bold text-red-700">
                  {documentacion.filter(d => d.estado_verificacion === 'rechazado').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de documentación */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documentacion.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay empresas con documentación
                  </td>
                </tr>
              ) : (
                documentacion.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{empresa.nombre_empresa}</p>
                        <p className="text-xs text-gray-500">{empresa.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empresa.ciudad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {empresa.total_documentos}/2
                        </span>
                        {empresa.documentos_completos && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(empresa.estado_verificacion)}`}>
                        {getEstadoIcon(empresa.estado_verificacion)}
                        {empresa.estado_verificacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(empresa.fecha_registro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setEmpresaSeleccionada(empresa)}
                        className="text-[#2C3A61] hover:text-[#1f2942] font-medium flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles */}
      {empresaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#2C3A61]">
                    {empresaSeleccionada.nombre_empresa}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {empresaSeleccionada.ciudad} • {empresaSeleccionada.email}
                  </p>
                </div>
                <button
                  onClick={() => setEmpresaSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información de la empresa */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Información de la Empresa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="text-sm font-medium text-gray-900">{empresaSeleccionada.direccion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="text-sm font-medium text-gray-900">{empresaSeleccionada.telefono || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Documentos ({empresaSeleccionada.total_documentos}/3)
                </h4>
                <div className="space-y-3">
                  {empresaSeleccionada.documentos.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay documentos cargados
                    </p>
                  ) : (
                    empresaSeleccionada.documentos.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#2C3A61]" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.tipo}</p>
                            <p className="text-xs text-gray-500">Documento subido</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleVerDocumento(doc.url)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#2C3A61] text-white rounded-lg hover:bg-[#1f2942] transition text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Estado de verificación */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Estado de Verificación</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCambiarEstado(empresaSeleccionada.id, 'pendiente')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      empresaSeleccionada.estado_verificacion === 'pendiente'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <Clock className="h-5 w-5 mx-auto mb-1" />
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(empresaSeleccionada.id, 'verificado')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      empresaSeleccionada.estado_verificacion === 'verificado'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                    Verificado
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(empresaSeleccionada.id, 'rechazado')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      empresaSeleccionada.estado_verificacion === 'rechazado'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <XCircle className="h-5 w-5 mx-auto mb-1" />
                    Rechazado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
