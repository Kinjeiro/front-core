import {
  includes,
} from './common';

describe('common utils', () => {
  describe('[function] includes', () => {
    it('should find includes in two arrays', () => {
      expect(includes(['1', 2, 3], [3])).to.equal(true);
    });
    it('should not find includes with [] second array', () => {
      expect(includes(['1', 2, 3], [])).to.equal(false);
    });
    it('should not find includes with null second array', () => {
      expect(includes(['1', 2, 3], null)).to.equal(false);
    });
    it('should not find includes with null second array wiht option "emptyIsInclude"', () => {
      expect(includes(['1', 2, 3], null, true)).to.equal(true);
    });
    it('should not find includes with null first array', () => {
      expect(includes(null, [1, 2])).to.equal(false);
    });
    it('should not find includes with difference arrays', () => {
      expect(includes(['1', '2'], [1, 2])).to.equal(false);
    });
  });
});
