import { pluralize } from './pluralize-utils';

describe('pluralize-utils', () => {
  describe('[function] pluralize', () => {
    const pluralizeDays = pluralize(['день', 'дня', 'дней']);
    it('should pluralize by numerals to день', () => {
      expect(pluralizeDays(1)).to.equal('день');
    });

    it('should pluralize by numerals to дня', () => {
      expect(pluralizeDays(2)).to.equal('дня');
    });

    it('should pluralize by numerals to дней', () => {
      expect(pluralizeDays(5)).to.equal('дней');
    });
  });
});
