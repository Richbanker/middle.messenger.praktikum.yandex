import { escapeHtml } from '@/utils/escapeHtml';

export const renderButton = (label: string, kind: 'primary' | 'ghost' = 'primary', attrs = '') =>
  `<button class="btn ${kind === 'primary' ? 'btn-primary' : 'btn-ghost'}" ${attrs}>${escapeHtml(label)}</button>`;
