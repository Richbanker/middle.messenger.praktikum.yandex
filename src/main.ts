import './styles/index.css';
import Handlebars from 'handlebars';

import inputTpl from './components/input.hbs?raw';
import avatarTpl from './components/avatar.hbs?raw';
import headingTpl from './components/heading.hbs?raw';

Handlebars.registerPartial('input', inputTpl);
Handlebars.registerPartial('avatar', avatarTpl);
Handlebars.registerPartial('heading', headingTpl);

export function mountTemplate(tplStr: string, ctx: unknown = {}) {
  const tpl = Handlebars.compile(tplStr);
  const html = tpl(ctx);
  const root = document.getElementById('app') ?? document.body;
  root.innerHTML = html;
}


