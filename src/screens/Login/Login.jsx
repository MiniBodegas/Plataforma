import { LoginForm } from "../../components/index";

export function Login() {
  return (
    <div className="min-h-screen">
      {/* ✅ Mantener solo el título aquí */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-[#2C3A61]">
          Iniciar sesión
        </h1>
      </div>
      <LoginForm />
    </div>
  );
}
