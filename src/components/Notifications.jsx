import { useNotifications } from '../hooks/useNotifications';

export function Notifications() {
  const { notificaciones } = useNotifications();

  if (notificaciones <= 0) {
    return null;
  }

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
      {notificaciones}
    </span>
  );
}