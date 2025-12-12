import { EventBus } from './EventBus';
import { nanoid } from './nanoid';

export type Props = Record<string, unknown>;

export abstract class Block<P extends Props = Props> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  } as const;

  public id = nanoid(6);
  protected props: P;
  protected children: Record<string, Block | Block[]>;
  protected eventBus: () => EventBus;
  private _element: HTMLElement | null = null;
  private _listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = [];

  constructor(props: P = {} as P) {
    const eventBus = new EventBus();
    this.props = this._makePropsProxy(props);
    this.children = {};
    this.eventBus = () => eventBus;
    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  private _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    // @ts-expect-error - EventBus типизация не проверяет состав аргументов
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _makePropsProxy(props: P): P {
    return new Proxy(props, {
      get: (target, prop: string) => {
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set: (target, prop: string, value) => {
        const oldTarget = { ...target };
        target[prop as keyof P] = value;
        this.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty: () => {
        throw new Error('Нет доступа');
      },
    });
  }

  private init(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private _componentDidMount(): void {
    this.componentDidMount();
  }

  protected componentDidMount(): void {}

  private _componentDidUpdate(oldProps: P, newProps: P): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (response) {
      this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  protected componentDidUpdate(_oldProps: P, _newProps: P): boolean {
    return true;
  }

  setProps = (nextProps: Partial<P>): void => {
    if (!nextProps) {
      return;
    }
    Object.assign(this.props, nextProps);
  };

  get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    this._removeEvents();
    const fragment = this.render();
    const newElement = fragment.firstElementChild as HTMLElement;

    if (!newElement) {
      return;
    }

    if (this._element && this._element.parentNode) {
      this._element.replaceWith(newElement);
    }

    this._element = newElement;
    this._addEvents();
    this.componentDidMount();
  }

  protected render(): DocumentFragment {
    return new DocumentFragment();
  }

  protected compile(template: (context: unknown) => string, context: unknown): DocumentFragment {
    const fragment = document.createElement('template');
    const htmlString = template(context);
    fragment.innerHTML = htmlString;

    Object.entries(this.children).forEach(([id, component]) => {
      const stub = fragment.content.querySelector(`[data-id="${id}"]`);
      if (!stub) {
        return;
      }

      const components = Array.isArray(component) ? component : [component];
      components.forEach((item) => {
        if (item.element) {
          stub.replaceWith(item.element);
        }
      });
    });

    return fragment.content;
  }

  private _addEvents(): void {
    const { events = {} } = this.props as P & { events?: Record<string, (e: Event) => void> };
    Object.keys(events).forEach((eventName) => {
      if (this._element && events[eventName]) {
        this._element.addEventListener(eventName, events[eventName] as EventListener);
      }
    });
  }

  private _removeEvents(): void {
    const { events = {} } = this.props as P & { events?: Record<string, (e: Event) => void> };
    Object.keys(events).forEach((eventName) => {
      if (this._element && events[eventName]) {
        this._element.removeEventListener(eventName, events[eventName] as EventListener);
      }
    });

    this._listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._listeners = [];
  }

  protected addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this._listeners.push({ element, event, handler });
  }

  getContent(): HTMLElement | null {
    return this._element;
  }

  show(): void {
    if (this._element) {
      this._element.style.display = 'block';
    }
  }

  hide(): void {
    if (this._element) {
      this._element.style.display = 'none';
    }
  }

  dispatchComponentDidMount(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
    Object.values(this.children).forEach((child) => {
      const children = Array.isArray(child) ? child : [child];
      children.forEach((item) => {
        item.dispatchComponentDidMount();
      });
    });
  }
}
