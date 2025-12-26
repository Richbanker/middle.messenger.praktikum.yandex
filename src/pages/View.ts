import { Block, Props } from '../core/Block.js';

export abstract class View extends Block<Props> {
  protected abstract render(): DocumentFragment;

  public show(): void {
    super.show();
    this.dispatchComponentDidMount();
  }
}

