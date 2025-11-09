type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export enum HttpStatus {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  MultipleChoices = 300,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500,
}

interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
  withCredentials?: boolean;
}

export class HTTPTransport {
  constructor(private base = '') {}

  get(url: string, options: RequestOptions = {}): Promise<unknown> {
    const { data, ...rest } = options;
    const fullUrl = data ? `${url}${this.queryStringify(data as Record<string, unknown>)}` : url;
    return this.request(fullUrl, { ...rest, method: 'GET' });
  }

  post(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'POST' });
  }

  put(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'PUT' });
  }

  delete(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  private request(url: string, options: RequestOptions & { method: Method }): Promise<unknown> {
    const { method, data, headers = {}, timeout = 5000, withCredentials = false } = options;

    return new Promise<unknown>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, this.base + url);

      xhr.withCredentials = withCredentials;
      xhr.timeout = timeout;

      let body: Document | XMLHttpRequestBodyInit | null = null;
      if (method !== 'GET' && data != null) {
        if (data instanceof FormData) {
          body = data;
        } else {
          xhr.setRequestHeader('Content-Type', 'application/json');
          body = JSON.stringify(data);
        }
      }

      Object.entries(headers).forEach(([k, v]) => {
        xhr.setRequestHeader(k, v);
      });

      xhr.onload = () => {
        const type = xhr.getResponseHeader('Content-Type') || '';
        const isJson = type.includes('application/json');
        try {
          const parsed = isJson && xhr.responseText ? JSON.parse(xhr.responseText) : xhr.responseText;
          if (xhr.status >= HttpStatus.Ok && xhr.status < HttpStatus.MultipleChoices) {
            resolve(parsed);
          } else {
            reject(parsed || new Error(`HTTP ${xhr.status}`));
          }
        } catch {
          if (xhr.status >= HttpStatus.Ok && xhr.status < HttpStatus.MultipleChoices) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Timeout'));

      xhr.send(body);
    });
  }

  private queryStringify(data: Record<string, unknown>): string {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => {
      if (v != null) {
        params.append(k, String(v));
      }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }
}
