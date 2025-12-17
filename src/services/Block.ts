import EventBus from "./EventBus.ts";
import Handlebars from "handlebars";
import { v4 as uuidv4 } from "uuid";

// Регистрируем helper eq
Handlebars.registerHelper("eq", function (a: any, b: any) {
  return a === b;
});
type EventBusType = {
  on: (event: string, callback: () => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
};

export interface BlockProps {
  [key: string]: Block | object | (() => void) | string | boolean | undefined;
  _id: string | undefined;
}

interface ParsedProps {
  children: { [key: string]: Block };
  props: {
    [key: string]: string | boolean | number | void | object | (() => void);
  };
  lists: { [key: string]: Block[] };
  _id?: string;
}

interface AnyProps {
  [key: string]:
    | Block
    | boolean
    | string
    | number
    | []
    | object
    | Block[]
    | never
    | void;
}

class Block {
  protected children: BlockProps;
  private lists: { [key: string]: Block[] | Block };
  private _meta: { tagName: string; props: AnyProps };
  public eventBus: EventBusType;

  protected props: BlockProps;

  private _id: string;

  static EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_RENDER: "flow:render",
    EVENT_FLOW_CDU: "flow:component-did-update",
  };
  private _element!: HTMLElement;

  constructor(tagName = "div", propsAndChild?: AnyProps) {
    this.eventBus = new EventBus();
    this._id = uuidv4();

    const { children, props, lists } = this.getChildren(propsAndChild);
    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy({ ...props, _id: this._id });
    this.children = this._makePropsProxy({ ...children, _id: this._id });
    this.lists = { ...lists };

    this._registerEvents(this.eventBus);
    this.eventBus.emit(Block.EVENTS.INIT);
  }

  getChildren(anyProps?: AnyProps): ParsedProps {
    const lists: { [key: string]: Block[] } = {};
    const children: { [key: string]: Block } = {};
    const props: { [key: string]: string | boolean | void | object } = {};
    if (anyProps) {
      Object.keys(anyProps).forEach((key: string) => {
        if (anyProps[key] instanceof Block) {
          children[key] = anyProps[key];
        } else if (Array.isArray(anyProps[key])) {
          lists[key] = anyProps[key].filter((item) => item instanceof Block);
        } else {
          props[key] = anyProps[key] as any;
        }
      });
    }

    return { children, props, lists };
  }

  private _registerEvents(eventBus: EventBusType): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(
      Block.EVENTS.EVENT_FLOW_CDU,
      this._componentDidUpdate.bind(this)
    );
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _createResources(): void {
    const { tagName } = this._meta!;
    this._element = this._createDocumentElement(tagName);
  }

  init(): void {
    this._createResources();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  compile(template: string, context?: BlockProps) {
    if (typeof context === "undefined") {
      context = this.props;
    }

    const contextAndStubs = { ...context };

    Object.keys(this?.children).forEach((key) => {
      if (this?.children[key] instanceof Block) {
        contextAndStubs[
          key
        ] = `<div data-id="${this?.children[key]._id}"></div>`;
      }
    });

    Object.keys(this.lists).forEach((key) => {
      contextAndStubs[key] = `<div data-id="list__${key}"></div>`;
    });

    const fragment = document.createElement("template");
    fragment.innerHTML = Handlebars.compile(template)(contextAndStubs);

    Object.values(this.children).forEach((child) => {
      if (child instanceof Block) {
        const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);

        if (stub) {
          stub.replaceWith(child.getContent());
        }
      }
    });

    Object.entries(this.lists).forEach(([key, child]) => {
      const stub = fragment.content.querySelector(`[data-id="list__${key}"]`);

      if (!stub) return;

      const listContent = document.createElement("template");

      if (Array.isArray(child)) {
        child.forEach((element: Block | boolean | string | HTMLElement) => {
          if (element instanceof Block) {
            listContent.content.append(element.getContent());
          } else {
            listContent.content.append(`${element}`);
          }
        });
      }

      stub.replaceWith(listContent.content);
    });
    return fragment.content;
  }

  private _componentDidMount(): void {
    this.componentDidMount();
  }

  componentDidMount(_oldProps?: BlockProps): void {}

  dispatchComponentDidMount(): void {
    this.eventBus.emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(
    oldProps?: BlockProps,
    newProps?: BlockProps
  ): boolean {
    return oldProps !== newProps;
  }

  componentDidUpdate(_oldProps?: BlockProps, _newProps?: BlockProps): boolean {
    return true;
  }

  setProps(nextProps?: Partial<BlockProps>): void {
    if (!nextProps) return;
    const { children, props, lists } = this.getChildren(nextProps);
    if (Object.values(children).length) {
      Object.assign(this.children, children);
    }
    if (Object.values(lists).length) {
      Object.assign(this.lists, lists);
    }
    if (Object.values(props).length) {
      Object.assign(this.props, props);
    }
  }

  get element(): HTMLElement {
    return <HTMLElement>this._element;
  }

  private _render(): void {
    this.removeEvents();

    const block = this.render();
    this._element.innerHTML = "";
    this._element?.appendChild(block);

    this.addEvents();
    this.addAttrs();
  }

  protected render(): Node {
    return this.compile("{{{content}}}");
  }

  getContent() {
    return this?._element;
  }

  private _makePropsProxy(props: BlockProps): BlockProps {
    const eventBus = this.eventBus;
    return new Proxy(props, {
      get(target, prop: string) {
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target, prop: string, value): boolean {
        const oldValue = { ...target };
        target[prop] = value;
        eventBus.emit(Block.EVENTS.EVENT_FLOW_CDU, oldValue, target);
        return true;
      },
    });
  }

  private _createDocumentElement(tagName: string): HTMLElement {
    return document.createElement(tagName);
  }

  show(): void {
    if (this.getContent()) {
      this.getContent()!.style.display = "block";
    }
  }

  hide(): void {
    if (this.getContent()) {
      this.getContent()!.style.display = "none";
    }
  }

  addAttrs() {
    const { attrs = {} } = this.props;

    Object.entries(attrs).forEach(([attrName, attrValue]: [string, string]) => {
      this.element.setAttribute(attrName, attrValue);
    });
  }

  addEvents() {
    const { events = {} } = this.props;

    Object.entries(events).forEach(
      ([eventName, event]: [string, (evt: Event) => object]) => {
        this.element.addEventListener(eventName, event);
      }
    );
  }

  removeEvents() {
    const { events = {} } = this.props;

    Object.entries(events).forEach(
      ([eventName, event]: [string, (evt: Event) => object]) => {
        this.element.removeEventListener(eventName, event);
      }
    );
  }
}

export default Block;
