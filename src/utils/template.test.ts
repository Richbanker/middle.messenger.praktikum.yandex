import { expect } from 'chai';
import { template } from './template.js';

describe('template', () => {
  describe('подстановка переменных', () => {
    it('должен заменять один плейсхолдер значением', () => {
      const str = 'Привет, {{name}}!';
      const data = { name: 'Мир' };
      const result = template(str, data);
      expect(result).to.equal('Привет, Мир!');
    });

    it('должен обрабатывать несколько плейсхолдеров', () => {
      const str = '{{greeting}}, {{name}}!';
      const data = { greeting: 'Привет', name: 'Мир' };
      const result = template(str, data);
      expect(result).to.equal('Привет, Мир!');
    });

    it('должен обрабатывать повторяющиеся плейсхолдеры', () => {
      const str = '{{word}} {{word}} {{word}}';
      const data = { word: 'тест' };
      const result = template(str, data);
      expect(result).to.equal('тест тест тест');
    });

    it('должен обрабатывать числовые значения', () => {
      const str = 'Число: {{num}}';
      const data = { num: 42 };
      const result = template(str, data);
      expect(result).to.equal('Число: 42');
    });

    it('должен обрабатывать булевы значения', () => {
      const str = 'Статус: {{active}}';
      const data = { active: true };
      const result = template(str, data);
      expect(result).to.equal('Статус: true');
    });
  });

  describe('обработка отсутствующих ключей', () => {
    it('должен оставлять плейсхолдер без изменений, если ключ отсутствует', () => {
      const str = 'Привет, {{name}}!';
      const data = {};
      const result = template(str, data);
      expect(result).to.equal('Привет, {{name}}!');
    });

    it('должен обрабатывать частично отсутствующие ключи', () => {
      const str = '{{greeting}}, {{name}}!';
      const data = { greeting: 'Привет' };
      const result = template(str, data);
      expect(result).to.equal('Привет, {{name}}!');
    });

    it('должен обрабатывать undefined значения', () => {
      const str = 'Значение: {{value}}';
      const data = { value: undefined };
      const result = template(str, data);
      expect(result).to.equal('Значение: {{value}}');
    });
  });

  describe('XSS защита', () => {
    it('должен экранировать script теги', () => {
      const str = 'Текст: {{content}}';
      const data = { content: '<script>alert("xss")</script>' };
      const result = template(str, data);
      expect(result).to.equal('Текст: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result).to.not.include('<script>');
    });

    it('должен экранировать onerror атрибуты', () => {
      const str = 'Изображение: {{img}}';
      const data = { img: '<img src="x" onerror="alert(1)">' };
      const result = template(str, data);
      expect(result).to.equal('Изображение: &lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
      expect(result).to.include('&lt;');
      expect(result).to.include('&quot;');
      expect(result).to.not.include('<img');
    });

    it('должен экранировать HTML теги', () => {
      const str = 'HTML: {{html}}';
      const data = { html: '<div>Тест</div>' };
      const result = template(str, data);
      expect(result).to.equal('HTML: &lt;div&gt;Тест&lt;/div&gt;');
      expect(result).to.not.include('<div>');
    });

    it('должен экранировать сложные XSS векторы', () => {
      const str = 'Вектор: {{vector}}';
      const data = { vector: '"><script>alert(1)</script><div' };
      const result = template(str, data);
      expect(result).to.equal('Вектор: &quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;div');
      expect(result).to.not.include('<script>');
    });

    it('должен экранировать амперсанды', () => {
      const str = 'Текст: {{text}}';
      const data = { text: 'A & B' };
      const result = template(str, data);
      expect(result).to.equal('Текст: A &amp; B');
    });

    it('должен экранировать кавычки', () => {
      const str = 'Текст: {{text}}';
      const data = { text: 'Say "hello"' };
      const result = template(str, data);
      expect(result).to.equal('Текст: Say &quot;hello&quot;');
    });
  });

  describe('граничные случаи', () => {
    it('должен обрабатывать пустую строку', () => {
      const str = '';
      const data = { name: 'Тест' };
      const result = template(str, data);
      expect(result).to.equal('');
    });

    it('должен обрабатывать строку без плейсхолдеров', () => {
      const str = 'Обычный текст без плейсхолдеров';
      const data = { name: 'Тест' };
      const result = template(str, data);
      expect(result).to.equal('Обычный текст без плейсхолдеров');
    });

    it('должен обрабатывать пустой объект данных', () => {
      const str = 'Привет, {{name}}!';
      const data = {};
      const result = template(str, data);
      expect(result).to.equal('Привет, {{name}}!');
    });

    it('должен обрабатывать null значения', () => {
      const str = 'Значение: {{value}}';
      const data = { value: null };
      const result = template(str, data);
      expect(result).to.equal('Значение: null');
    });

    it('должен обрабатывать пустые строки как значения', () => {
      const str = 'Значение: "{{value}}"';
      const data = { value: '' };
      const result = template(str, data);
      expect(result).to.equal('Значение: ""');
    });
  });

  describe('вложенные структуры', () => {
    it('должен обрабатывать объекты как строку', () => {
      const str = 'Объект: {{obj}}';
      const data = { obj: { key: 'value' } };
      const result = template(str, data);
      expect(result).to.include('[object Object]');
    });

    it('должен обрабатывать массивы как строку', () => {
      const str = 'Массив: {{arr}}';
      const data = { arr: [1, 2, 3] };
      const result = template(str, data);
      expect(result).to.include('1,2,3');
    });
  });
});

