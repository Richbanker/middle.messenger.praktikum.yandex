import './style.css';
import { router } from './router';
import { routes } from './routes';

const root = document.getElementById('app');
if (!root) {
  throw new Error('#app not found');
}

routes.forEach(({ path, factory }) => router.use(path, factory));
router.start(root);
