import Block from '../../services/Block.js';

export default class ProfilePage extends Block {
  protected render(): DocumentFragment {
    const fragment = document.createElement('template');
    fragment.innerHTML = '<div></div>';
    return fragment.content;
  }
}
