import {
  includes,
  valueFromRange,
  difference,
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
    it('should find all values', () => {
      expect(includes([1, 2], [1, 2, 3, 4, 5], undefined, true)).to.equal(true);
    });
    it('should not find all requested values', () => {
      expect(includes([1, 2], [1, 3, 4, 5], undefined, true)).to.equal(false);
    });
  });

  describe('[function] valueFromRange', () => {
    it('should find start position', () => {
      expect(valueFromRange(0, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y')).to.equal('a');
    });
    it('should find middle position', () => {
      expect(valueFromRange(13, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y')).to.equal('c');
    });
    it('should find last position', () => {
      expect(valueFromRange(20, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y')).to.equal('d');
    });
    it('should return out range value', () => {
      expect(valueFromRange(25, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y')).to.equal('Y');
    });
    it('should return value from input values', () => {
      expect(valueFromRange(13, [0, 5, 8, 15, 20])).to.equal(8);
    });
  });

  describe('[function] difference', () => {
    it('should return diff from minus', () => {
      expect(difference([1, 2, 3], [3, 4, 5])).to.deep.equal([1, 2]);
    });
    it('should part array if minus one', () => {
      expect(difference([1, 2, 3], [3])).to.deep.equal([1, 2]);
    });
    it('should full array if search empty', () => {
      expect(difference([1, 2, 3])).to.deep.equal([1, 2, 3]);
    });
    it('should equal array if minus has other values', () => {
      expect(difference([3], [1, 2, 4])).to.deep.equal([3]);
    });
    it('should empty array if minus has one correct value from other', () => {
      expect(difference([3], [1, 2, 3])).to.deep.equal([]);
    });
  });
});
