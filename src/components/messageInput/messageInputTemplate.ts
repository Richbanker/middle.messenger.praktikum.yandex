export const messageInputTemplate = `<form class="message-input message-form">
  <input name="message" type="text" placeholder="{{placeholder}}" required>
  <button type="submit" class="send-button">
    {{> icon name="send"}}
  </button>
</form>`;
