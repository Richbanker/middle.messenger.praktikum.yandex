import { LoginPage } from './pages/LoginPage';
import { MessengerPage } from './pages/MessengerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignUpPage } from './pages/SignUpPage';

export const routes = [
  { path: '/', factory: () => new LoginPage() },
  { path: '/sign-up', factory: () => new SignUpPage() },
  { path: '/settings', factory: () => new SettingsPage() },
  { path: '/messenger', factory: () => new MessengerPage() },
  { path: '/404', factory: () => new NotFoundPage() },
];
