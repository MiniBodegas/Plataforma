// contexts/AppProviders.jsx
import { AuthProvider } from './AuthContext';
import { UserProfileProvider } from './UserProfileContext';
import { NotificationProvider } from './NotificationContext';
import { ToastProvider } from './ToastContext';

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <UserProfileProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserProfileProvider>
      </AuthProvider>
    </ToastProvider>
  );
}