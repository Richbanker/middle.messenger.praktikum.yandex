import { escapeHtml } from '@/utils/escapeHtml';

type FieldOptions = {
  label: string;
  name: string;
  type?: string;
  value?: string;
  required?: boolean;
  autocomplete?: string;
  placeholder?: string;
};

export const renderField = (options: FieldOptions) => {
  const { label, name, type = 'text', value = '', required, autocomplete, placeholder } = options;
  return `
    <div class="field">
      <span>${escapeHtml(label)}</span>
      <input
        name="${escapeHtml(name)}"
        type="${escapeHtml(type)}"
        ${required ? 'required' : ''}
        ${autocomplete ? `autocomplete="${escapeHtml(autocomplete)}"` : ''}
        ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
        value="${escapeHtml(value)}"
      />
    </div>
  `;
};
