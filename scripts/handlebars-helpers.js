import Handlebars from "handlebars";

// Регистрируем helper eq
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

// Регистрируем helper ifeq
Handlebars.registerHelper("ifeq", function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
});
