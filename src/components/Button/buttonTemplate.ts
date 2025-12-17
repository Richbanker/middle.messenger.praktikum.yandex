export const buttonTemplate = `
<button
  class="btn {{#if pulse}}btn--pulse{{/if}} {{class}}"
  type="{{type}}"
  {{#if disabled}}disabled{{/if}}
  {{#if id}}id="{{id}}"{{/if}}
  {{#if data-action}}data-action="{{data-action}}"{{/if}}
>
  {{text}}
  {{#if icon}}
    <span class="btn__icon">{{> icon name=icon}}</span>
  {{/if}}
</button>
`;
