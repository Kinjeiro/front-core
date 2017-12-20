const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function getHumanMonth(month) {
  return MONTHS[(+month) - 1];
}

/**
 * Переводит дату из формата '2016-01-26' в формат '26 января 2016' или 26.1.2016.
 *
 * @param {String} date Строка даты в формате `YYYY-MM-DD`
 * @param {Object} [options] Список опций
 * @param {Boolean} [options.fullMonth=true] Если `true`, то название месяца, иначе номер
 * @param {Boolean} [options.cutCurrentYear=true] Если `true`, то дата без указания года
 * @return {String} Cтрока даты в формате `DD month YYYY или DD.MM.YYYY`
 */
export default function formatDate(date, options) {
  const defaults = {
    fullMonth: true,
    cutCurrentYear: true,
  };

  options = {
    ...defaults,
    ...options,
  };

  let [year, month, day] = date.split('-');

  if (options.cutCurrentYear) {
    const currentYear = `${new Date().getFullYear()}`;
    year = year === currentYear ? null : year;
  }

  if (options.fullMonth) {
    return `${+day} ${getHumanMonth(month)}${year ? ` ${year}` : ''}`;
  }

  return `${+day}.${month}${year ? `.${year}` : ''}`;
}
