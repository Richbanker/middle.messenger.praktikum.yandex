import { expect } from 'chai';
import { Block } from './Block.js';

class TestBlock extends Block {
  protected render(): DocumentFragment {
    const fragment = document.createElement('template');
    fragment.innerHTML = '<div class="test-block">Test Content</div>';
    return fragment.content;
  }
}

class TestBlockWithProps extends Block<{ title: string; count: number }> {
  protected render(): DocumentFragment {
    const fragment = document.createElement('template');
    fragment.innerHTML = `<div class="test-block">${this.props.title} - ${this.props.count}</div>`;
    return fragment.content;
  }
}

class TestBlockWithEvents extends Block<{ events?: Record<string, (e: Event) => void> }> {
  protected render(): DocumentFragment {
    const fragment = document.createElement('template');
    fragment.innerHTML = '<button class="test-button">Click me</button>';
    return fragment.content;
  }
}

class TestBlockWithChildren extends Block {
  protected render(): DocumentFragment {
    const child = new TestBlock();
    this.children = { child };
    child.dispatchComponentDidMount();

    const fragment = document.createElement('template');
    fragment.innerHTML = '<div class="parent"><div data-id="child"></div></div>';
    const stub = fragment.content.querySelector('[data-id="child"]');
    if (stub && child.element) {
      stub.replaceWith(child.element);
    }
    return fragment.content;
  }
}

describe('Block', () => {
  describe('создание компонента', () => {
    it('должен создавать компонент с пустыми props', () => {
      const block = new TestBlock();
      expect(block).to.be.instanceOf(Block);
      expect(block.id).to.be.a('string');
      expect(block.id.length).to.be.greaterThan(0);
    });

    it('должен создавать компонент с props', () => {
      const props = { title: 'Test', count: 42 };
      const block = new TestBlockWithProps(props);
      expect(block).to.be.instanceOf(Block);
    });

    it('должен генерировать уникальный id для каждого компонента', () => {
      const block1 = new TestBlock();
      const block2 = new TestBlock();
      expect(block1.id).to.not.equal(block2.id);
    });
  });

  describe('генерация DOM', () => {
    it('должен генерировать DOM элемент', () => {
      const block = new TestBlock();
      block.dispatchComponentDidMount();
      
      const element = block.getContent();
      expect(element).to.not.be.null;
      expect(element?.tagName).to.equal('DIV');
      expect(element?.className).to.equal('test-block');
      expect(element?.textContent).to.equal('Test Content');
    });

    it('должен иметь element после dispatchComponentDidMount', () => {
      const block = new TestBlock();
      block.dispatchComponentDidMount();
      expect(block.element).to.not.be.null;
    });

    it('должен обновлять DOM при изменении props', () => {
      const block = new TestBlockWithProps({ title: 'Initial', count: 0 });
      block.dispatchComponentDidMount();
      
      expect(block.getContent()?.textContent).to.equal('Initial - 0');
      
      block.setProps({ count: 10 });
      
      expect(block.getContent()?.textContent).to.equal('Initial - 10');
    });
  });

  describe('обновление props', () => {
    it('должен обновлять props через setProps', () => {
      const block = new TestBlockWithProps({ title: 'Test', count: 0 });
      block.setProps({ count: 5 });
      
      expect(block.getContent()?.textContent).to.include('5');
    });

    it('должен обновлять props через setProps', () => {
      const block = new TestBlockWithProps({ title: 'Test', count: 0 });
      block.dispatchComponentDidMount();
      
      block.setProps({ count: 10 });
      
      expect(block.getContent()?.textContent).to.include('10');
    });

    it('должен вызывать componentDidUpdate при изменении props', () => {
      let updateCalled = false;
      class UpdateTestBlock extends Block<{ value: number }> {
        protected componentDidUpdate(): boolean {
          updateCalled = true;
          return true;
        }
        protected render(): DocumentFragment {
          const fragment = document.createElement('template');
          fragment.innerHTML = `<div>${this.props.value}</div>`;
          return fragment.content;
        }
      }

      const block = new UpdateTestBlock({ value: 1 });
      block.dispatchComponentDidMount();
      block.setProps({ value: 2 });
      
      expect(updateCalled).to.be.true;
    });

    it('должен обрабатывать пустой setProps', () => {
      const block = new TestBlock();
      expect(() => block.setProps({})).to.not.throw();
    });
  });

  describe('события', () => {
    it('должен добавлять обработчики событий из props', () => {
      let clicked = false;
      const block = new TestBlockWithEvents({
        events: {
          click: () => {
            clicked = true;
          },
        },
      });
      block.dispatchComponentDidMount();
      
      const button = block.getContent()?.querySelector('.test-button');
      if (button) {
        const clickEvent = new window.MouseEvent('click', { bubbles: true });
        button.dispatchEvent(clickEvent);
        expect(clicked).to.be.true;
      }
    });

    it('должен обрабатывать события при перерисовке', () => {
      let clickCount = 0;
      const block = new TestBlockWithEvents({
        events: {
          click: () => {
            clickCount++;
          },
        },
      });
      block.dispatchComponentDidMount();
      
      const button = block.getContent()?.querySelector('.test-button');
      if (button) {
        button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(clickCount).to.equal(1);
        block.setProps({});
        button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(clickCount).to.equal(2);
      }
    });

    it('должен обрабатывать события через props.events', () => {
      let listenerCalled = false;
      class CustomEventBlock extends Block<{ events?: Record<string, (e: Event) => void> }> {
        protected render(): DocumentFragment {
          const fragment = document.createElement('template');
          fragment.innerHTML = '<div class="custom">Test</div>';
          return fragment.content;
        }
      }

      const block = new CustomEventBlock({
        events: {
          'custom-event': () => {
            listenerCalled = true;
          },
        },
      });
      block.dispatchComponentDidMount();
      
      const element = block.getContent();
      if (element) {
        const event = new window.Event('custom-event');
        element.dispatchEvent(event);
        expect(listenerCalled).to.be.true;
      }
    });
  });

  describe('children и slots', () => {
    it('должен обрабатывать children через compile', () => {
      const parent = new TestBlockWithChildren();
      parent.dispatchComponentDidMount();
      
      const content = parent.getContent();
      expect(content).to.not.be.null;
      expect(content?.querySelector('.test-block')).to.not.be.null;
    });

    it('должен заменять data-id stubs на элементы children', () => {
      class ParentBlock extends Block {
        protected render(): DocumentFragment {
          const child = new TestBlock();
          this.children = { child };
          child.dispatchComponentDidMount();

          return this.compile(
            () => '<div class="parent"><div data-id="child"></div></div>',
            {}
          );
        }
      }

      const parent = new ParentBlock();
      parent.dispatchComponentDidMount();
      
      const content = parent.getContent();
      const childElement = content?.querySelector('.test-block');
      expect(childElement).to.not.be.null;
      expect(content?.querySelector('[data-id="child"]')).to.be.null;
    });
  });

  describe('show/hide', () => {
    it('должен показывать элемент через show()', () => {
      const block = new TestBlock();
      block.dispatchComponentDidMount();
      block.hide();
      block.show();
      
      const element = block.getContent();
      expect(element?.style.display).to.equal('block');
    });

    it('должен скрывать элемент через hide()', () => {
      const block = new TestBlock();
      block.dispatchComponentDidMount();
      block.hide();
      
      const element = block.getContent();
      expect(element?.style.display).to.equal('none');
    });
  });

  describe('lifecycle', () => {
    it('должен вызывать componentDidMount', () => {
      let mountCalled = false;
      class LifecycleBlock extends Block {
        protected componentDidMount(): void {
          mountCalled = true;
        }
        protected render(): DocumentFragment {
          const fragment = document.createElement('template');
          fragment.innerHTML = '<div>Test</div>';
          return fragment.content;
        }
      }

      const block = new LifecycleBlock();
      block.dispatchComponentDidMount();
      
      expect(mountCalled).to.be.true;
    });

    it('должен вызывать dispatchComponentDidMount для children', () => {
      let childMountCalled = false;
      class ChildBlock extends Block {
        protected componentDidMount(): void {
          childMountCalled = true;
        }
        protected render(): DocumentFragment {
          const fragment = document.createElement('template');
          fragment.innerHTML = '<div>Child</div>';
          return fragment.content;
        }
      }

      class ParentBlock extends Block {
        protected render(): DocumentFragment {
          const child = new ChildBlock();
          this.children = { child };
          child.dispatchComponentDidMount();

          return this.compile(
            () => '<div data-id="child"></div>',
            {}
          );
        }
      }

      const parent = new ParentBlock();
      parent.dispatchComponentDidMount();
      
      expect(childMountCalled).to.be.true;
    });
  });

  describe('защита от удаления props', () => {
    it('должен выбрасывать ошибку при попытке удалить свойство', () => {
      const block = new TestBlockWithProps({ title: 'Test', count: 0 });
      expect(() => {
        const props = block as any;
        delete props.props.title;
      }).to.throw('Нет доступа');
    });
  });
});

