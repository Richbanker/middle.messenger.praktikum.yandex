export const messageTemplate = `<div class="message message--{{type}}">
  <div class="message-bubble">
    {{#if senderName}}
      <div class="message-sender">{{senderName}}</div>
    {{/if}}
    <div class="message-text">{{content}}</div>
    <div class="message-meta">
      <span class="message-time">{{time}}</span>
    </div>
  </div>
</div>`;
