import { LoginForm } from "../../components/index";

export function Login() {
  return (
    <div className="bg-gray-50 min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-[#2C3A61] mb-6">
        Iniciar sesión
      </h1>
      <LoginForm />
    </div>
  );
}
