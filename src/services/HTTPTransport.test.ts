import { expect } from 'chai';
import { HTTPTransport } from './HTTPTransport.js';

class MockXMLHttpRequest {
  public method: string = '';
  public url: string = '';
  public requestHeaders: Record<string, string> = {};
  public body: string | FormData | null = null;
  public timeout: number = 0;
  public withCredentials: boolean = false;
  public status: number = 200;
  public responseText: string = '';
  public responseHeaders: Record<string, string> = {};

  private onloadHandler: (() => void) | null = null;
  private onerrorHandler: (() => void) | null = null;
  private ontimeoutHandler: (() => void) | null = null;

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string): void {
    this.requestHeaders[name] = value;
  }

  send(body: string | FormData | null): void {
    this.body = body;
    setTimeout(() => {
      if (this.onloadHandler) {
        this.onloadHandler();
      }
    }, 0);
  }

  getResponseHeader(name: string): string | null {
    return this.responseHeaders[name] || null;
  }

  set onload(handler: (() => void) | null) {
    this.onloadHandler = handler;
  }

  set onerror(handler: (() => void) | null) {
    this.onerrorHandler = handler;
  }

  set ontimeout(handler: (() => void) | null) {
    this.ontimeoutHandler = handler;
  }

  simulateSuccess(status: number, responseText: string, contentType: string = 'application/json'): void {
    this.status = status;
    this.responseText = responseText;
    this.responseHeaders['Content-Type'] = contentType;
    if (this.onloadHandler) {
      this.onloadHandler();
    }
  }

  simulateError(): void {
    if (this.onerrorHandler) {
      this.onerrorHandler();
    }
  }

  simulateTimeout(): void {
    if (this.ontimeoutHandler) {
      this.ontimeoutHandler();
    }
  }
}

describe('HTTPTransport', () => {
  let httpTransport: HTTPTransport;
  let originalXHR: typeof XMLHttpRequest;
  let mockXHR: MockXMLHttpRequest;

  beforeEach(() => {
    originalXHR = (global as any).XMLHttpRequest;
    mockXHR = new MockXMLHttpRequest();
    (global as any).XMLHttpRequest = class {
      constructor() {
        return mockXHR;
      }
    } as typeof XMLHttpRequest;
    httpTransport = new HTTPTransport();
  });

  afterEach(() => {
    (global as any).XMLHttpRequest = originalXHR;
  });

  describe('формирование URL', () => {
    it('должен использовать baseUrl при создании', () => {
      const transport = new HTTPTransport('https://api.example.com');
      expect(transport).to.be.instanceOf(HTTPTransport);
    });

    it('должен добавлять baseUrl к endpoint', (done) => {
      const transport = new HTTPTransport('https://api.example.com');
      transport.get('/users').catch(() => {});
      
      setTimeout(() => {
        expect(mockXHR.url).to.equal('https://api.example.com/users');
        done();
      }, 10);
    });

    it('должен работать без baseUrl', (done) => {
      httpTransport.get('/users').catch(() => {});
      
      setTimeout(() => {
        expect(mockXHR.url).to.equal('/users');
        done();
      }, 10);
    });
  });

  describe('метод GET', () => {
    it('должен выполнять GET запрос', (done) => {
      httpTransport.get('/users').then(() => {
        expect(mockXHR.method).to.equal('GET');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });

    it('должен добавлять query параметры к URL', (done) => {
      httpTransport.get('/users', { data: { page: 1, limit: 10 } }).then(() => {
        expect(mockXHR.url).to.include('page=1');
        expect(mockXHR.url).to.include('limit=10');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });

    it('должен обрабатывать пустые query параметры', (done) => {
      httpTransport.get('/users', { data: {} }).then(() => {
        expect(mockXHR.url).to.equal('/users');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });
  });

  describe('метод POST', () => {
    it('должен выполнять POST запрос', (done) => {
      httpTransport.post('/users', { data: { name: 'Test' } }).then(() => {
        expect(mockXHR.method).to.equal('POST');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(201, '{"id": 1}');
    });

    it('должен отправлять JSON данные', (done) => {
      const data = { name: 'Test', age: 25 };
      httpTransport.post('/users', { data }).then(() => {
        expect(mockXHR.requestHeaders['Content-Type']).to.equal('application/json');
        expect(mockXHR.body).to.equal(JSON.stringify(data));
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(201, '{"id": 1}');
    });

    it('должен отправлять FormData', (done) => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');
      
      httpTransport.post('/upload', { data: formData }).then(() => {
        expect(mockXHR.body).to.equal(formData);
        expect(mockXHR.requestHeaders['Content-Type']).to.be.undefined;
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '{"success": true}');
    });
  });

  describe('метод PUT', () => {
    it('должен выполнять PUT запрос', (done) => {
      httpTransport.put('/users/1', { data: { name: 'Updated' } }).then(() => {
        expect(mockXHR.method).to.equal('PUT');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '{"id": 1}');
    });

    it('должен отправлять данные в теле запроса', (done) => {
      const data = { name: 'Updated' };
      httpTransport.put('/users/1', { data }).then(() => {
        expect(mockXHR.body).to.equal(JSON.stringify(data));
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '{"id": 1}');
    });
  });

  describe('метод DELETE', () => {
    it('должен выполнять DELETE запрос', (done) => {
      httpTransport.delete('/users/1').then(() => {
        expect(mockXHR.method).to.equal('DELETE');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(204, '');
    });

    it('не должен отправлять тело для DELETE запроса', (done) => {
      httpTransport.delete('/users/1').then(() => {
        expect(mockXHR.body).to.be.null;
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(204, '');
    });
  });

  describe('заголовки', () => {
    it('должен устанавливать кастомные заголовки', (done) => {
      httpTransport.get('/users', {
        headers: { 'Authorization': 'Bearer token123', 'X-Custom': 'value' }
      }).then(() => {
        expect(mockXHR.requestHeaders['Authorization']).to.equal('Bearer token123');
        expect(mockXHR.requestHeaders['X-Custom']).to.equal('value');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });

    it('должен устанавливать Content-Type для JSON', (done) => {
      httpTransport.post('/users', { data: { name: 'Test' } }).then(() => {
        expect(mockXHR.requestHeaders['Content-Type']).to.equal('application/json');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(201, '{"id": 1}');
    });
  });

  describe('обработка статусов', () => {
    it('должен разрешать промис для успешных статусов (200-299)', (done) => {
      httpTransport.get('/users').then((response) => {
        expect(response).to.deep.equal([]);
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });

    it('должен отклонять промис для ошибок (400+)', (done) => {
      httpTransport.get('/users').then(() => {
        done(new Error('Should have rejected'));
      }).catch((error) => {
        expect(error).to.exist;
        done();
      });
      
      mockXHR.simulateSuccess(404, '{"error": "Not found"}');
    });

    it('должен обрабатывать 500 ошибку', (done) => {
      httpTransport.get('/users').then(() => {
        done(new Error('Should have rejected'));
      }).catch((error) => {
        expect(error).to.exist;
        done();
      });
      
      mockXHR.simulateSuccess(500, '{"error": "Internal server error"}');
    });

    it('должен обрабатывать не-JSON ответы', (done) => {
      httpTransport.get('/text').then((response) => {
        expect(response).to.equal('Plain text response');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, 'Plain text response', 'text/plain');
    });
  });

  describe('обработка ошибок', () => {
    it('должен обрабатывать сетевые ошибки', (done) => {
      httpTransport.get('/users').then(() => {
        done(new Error('Should have rejected'));
      }).catch((error) => {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Network error');
        done();
      });
      
      mockXHR.simulateError();
    });

    it('должен обрабатывать таймауты', (done) => {
      httpTransport.get('/users', { timeout: 1000 }).then(() => {
        done(new Error('Should have rejected'));
      }).catch((error) => {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Timeout');
        done();
      });
      
      mockXHR.simulateTimeout();
    });

    it('должен устанавливать таймаут', (done) => {
      httpTransport.get('/users', { timeout: 5000 }).then(() => {
        expect(mockXHR.timeout).to.equal(5000);
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });
  });

  describe('withCredentials', () => {
    it('должен устанавливать withCredentials', (done) => {
      httpTransport.get('/users', { withCredentials: true }).then(() => {
        expect(mockXHR.withCredentials).to.be.true;
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });

    it('должен использовать false по умолчанию', (done) => {
      httpTransport.get('/users').then(() => {
        expect(mockXHR.withCredentials).to.be.false;
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });
  });

  describe('queryStringify', () => {
    it('должен правильно формировать query строку', (done) => {
      httpTransport.get('/users', {
        data: { page: 1, limit: 10, search: 'test' }
      }).then(() => {
        expect(mockXHR.url).to.include('page=1');
        expect(mockXHR.url).to.include('limit=10');
        expect(mockXHR.url).to.include('search=test');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });

    it('должен игнорировать null и undefined значения', (done) => {
      httpTransport.get('/users', {
        data: { page: 1, limit: null, search: undefined }
      }).then(() => {
        expect(mockXHR.url).to.include('page=1');
        expect(mockXHR.url).to.not.include('limit');
        expect(mockXHR.url).to.not.include('search');
        done();
      }).catch(done);
      
      mockXHR.simulateSuccess(200, '[]');
    });
  });
});

