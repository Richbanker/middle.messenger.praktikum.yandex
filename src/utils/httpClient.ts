import type { ApiError } from '@/types';

export const API_BASE_URL = 'https://ya-praktikum.tech/api/v2';
export const RESOURCES_BASE_URL = `${API_BASE_URL}/resources`;

export class HttpError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const parseResponse = async <T>(response: Response): Promise<T | null> => {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
};

export const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const isFormData = init.body instanceof FormData;
  const headers = new Headers(init.headers ?? {});

  if (!isFormData && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const parsed = await parseResponse<T | ApiError>(response);

  if (!response.ok) {
    const message =
      parsed && typeof parsed === 'object' && 'reason' in parsed
        ? (parsed as ApiError).reason
        : response.statusText;
    throw new HttpError(message || 'Request failed', response.status);
  }

  return (parsed as T) ?? (null as T);
};
