export function AuthStep({ 
  user,
  formData,
  showLogin,
  setShowLogin,
  loading,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleInputChange,
  nextStep
}) {
  if (user) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 font-medium">¡Ya estás logueado!</p>
            <p className="text-green-600 text-sm">
              Conectado como: {user.email}
            </p>
          </div>
          <button
            onClick={nextStep}
            className="bg-[#4B799B] text-white px-4 py-2 rounded-md hover:bg-[#3b5f7a] transition"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (!showLogin) {
    return (
      <form onSubmit={handleRegisterSubmit} className="bg-gray-50 p-4 rounded-lg shadow w-full">
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Nombre</label>
          <input
            type="text"
            value={formData.nombre || ""}
            onChange={handleInputChange('nombre')}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
            disabled={loading}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
            disabled={loading}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Contraseña</label>
          <input
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
            disabled={loading}
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4B799B] text-white py-2 rounded-md font-semibold hover:bg-[#3b5f7a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Registrando...
            </div>
          ) : (
            'Registrarse'
          )}
        </button>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-[#4B799B] hover:underline font-medium"
            onClick={() => setShowLogin(true)}
            disabled={loading}
          >
            Ya tengo cuenta
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleLoginSubmit} className="bg-gray-50 p-4 rounded-lg shadow w-full">
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
          disabled={loading}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1 text-[#2C3A61]">Contraseña</label>
        <input
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
          disabled={loading}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#4B799B] text-white py-2 rounded-md font-semibold hover:bg-[#3b5f7a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Iniciando sesión...
          </div>
        ) : (
          'Iniciar sesión'
        )}
      </button>
      <div className="text-center mt-4">
        <button
          type="button"
          className="text-[#4B799B] hover:underline font-medium"
          onClick={() => setShowLogin(false)}
          disabled={loading}
        >
          Quiero registrarme
        </button>
      </div>
    </form>
  );
}