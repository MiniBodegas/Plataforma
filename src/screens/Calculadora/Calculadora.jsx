import { Calculadora } from '../../components/index';

export function CalculadoraScreen() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
          Calculadora
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
      </div>
      <Calculadora />
    </div>
  );
}
