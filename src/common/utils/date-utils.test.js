import moment from 'moment';

import {
  parseDate,
  compareDate,
  fromNow
} from './date-utils';

describe('date-utils', () => {
  describe('[function] parseDate', () => {
    it('should parse by default string date without time', () => {
      expect(parseDate('2017-11-08')).to.be.exist;
    });
    it('should parse by default string date with time', () => {
      expect(parseDate('2017-11-08 10:30')).to.be.exist;
    });
    it('should parse by default iso string date', () => {
      expect(parseDate('2017-10-01T07:30:00.000Z')).to.be.exist;
    });
  });

  describe('[function] compareDate', () => {
    it('should correct equals dates with time', () => {
      const dateA = moment('2017-08-30 10:30');
      const dateB = moment('2017-08-30 11:30');

      expect(compareDate(dateA, dateB)).to.equal(0);
    });

    it('should correct compares dates when first is before', () => {
      const dateA = moment('2017-08-30 10:30');
      const dateB = moment('2017-08-31 10:30');

      expect(compareDate(dateA, dateB)).to.equal(-1);
    });

    it('should correct compares dates when first is after', () => {
      const dateA = moment('2017-08-30 10:30');
      const dateB = moment('2017-08-29 10:30');

      expect(compareDate(dateA, dateB)).to.equal(1);
    });

    it('should n\'t equals dates with different time', () => {
      const dateA = moment('2017-08-30 10:30');
      const dateB = moment('2017-08-30 11:30');

      expect(compareDate(dateA, dateB, false)).to.equal(-1);
    });

    it('should equals dates with different input format', () => {
      const dateA = new Date();
      const dateB = new Date();

      expect(compareDate(dateA, dateB)).to.equal(0);
    });

    it('should calculate time from now', () => {
      const dateA = moment().subtract(1, 'days');

      expect(fromNow(dateA)).to.equal(1);
    });
  });
});
