export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2C3A61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando permisos de administrador...</p>
        <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
      </div>
    </div>
  );
}
