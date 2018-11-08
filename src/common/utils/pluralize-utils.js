export const pluralize = (function () {
  const cases = [2, 0, 1, 1, 1, 2];
  const pluralizeSubFunction = function (titles, number) {
    number = Math.abs(number);
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }
  return function (_titles) {
    if (arguments.length === 1) {
      return function (_number) {
        return pluralizeSubFunction(_titles, _number)
      }
    } else {
      return pluralizeSubFunction.apply(null, arguments)
    }
  }
})();
