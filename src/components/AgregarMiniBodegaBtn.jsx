export function AgregarMiniBodegaBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#F7F8FA] rounded-xl flex flex-col items-center justify-center w-28 h-28 shadow border-none"
      type="button"
    >
      <span className="text-3xl text-[#222] mb-2">+</span>
      <span className="text-[#222] text-sm text-center leading-tight">
        Agrega otra<br />mini bodega
      </span>
    </button>
  );
}