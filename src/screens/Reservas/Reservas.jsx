import { ReservaCard } from "../../components";

export function Reservas() {
  return (
    <div className="max-h-screen bg-white">
        <h2>Mis mini bodegas</h2>

        {/* Segunda NavBar*/}
        <h3>Pendientes</h3>
      <ReservaCard />
    </div>
  );
}
