export const pluralize = (function () {
  const cases = [2, 0, 1, 1, 1, 2];
  const pluralizeSubFunction = function (titles, number) {
    number = Math.abs(number);
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }
  return function (_titles) {
    if (arguments.length === 1) {
      return function (_number) {
        return pluralizeSubFunction(_titles, _number);
      };
    }
    return pluralizeSubFunction(...arguments);
  };
})();

export function toTranslitFromRu(text) {
  return text.replace(/([а-яё])|([\s_-])|([^a-z\d])/gi,
    (all, ch, space, words/* , i*/) => {
      if (space || words) {
        return space ? '-' : '';
      }
      const code = ch.charCodeAt(0);
      const index = code === 1025 || code === 1105
        ? 0
        : code > 1071
          ? code - 1071
          : code - 1039;
      const t = [
        'yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh',
        'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
        'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh',
        'shch', '', 'y', '', 'e', 'yu', 'ya',
      ];
      return t[index];
    });
}
