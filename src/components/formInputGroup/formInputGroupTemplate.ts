export const formInputGroupTemplate = `<div class="input-group {{#if error}}input-group--error{{/if}}">
  <label class="input-group__label" for="{{id}}">
    {{label}}
    {{#if required}}<span class="input-group__required">*</span>{{/if}}
  </label>

  {{> formInput
    type=type
    id=id
    name=name
    placeholder=placeholder
    autocomplete=autocomplete
    required=required
    value=value
  }}

  {{#if icon}}
    <div class="input-group__icon">
      {{> icon name=icon}}
    </div>
  {{/if}}
</div>`;
