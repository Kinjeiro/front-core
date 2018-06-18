import {
  includes,
  formatString,
} from './common';

describe('common utils', () => {
  describe('[function] includes', () => {
    it('should find includes in two arrays', () => {
      expect(includes(['1', 2, 3], [3])).to.equal(true);
    });
    it('should not find includes with null second array', () => {
      expect(includes(['1', 2, 3], null)).to.equal(false);
    });
    it('should not find includes with null first array', () => {
      expect(includes(null, [1, 2])).to.equal(false);
    });
    it('should not find includes with difference arrays', () => {
      expect(includes(['1', '2'], [1, 2])).to.equal(false);
    });
  });

  describe('[function] formatString', () => {
    it('should format from map', () => {
      expect(formatString(
        '{test1}: {test2} {test1}',
        {
          test1: 'foo',
          test2: 'bar',
        },
      )).to.equal('foo: bar foo');
    });
    it('should format from map with empty param', () => {
      expect(formatString(
        '{test1}: {test2}! {test1}',
        {
          test2: 'bar',
        },
      )).to.equal('bar! ');
    });
    it('should format from array args', () => {
      expect(formatString(
        '{test1}: {test2} {test1}',
        'foo',
        'bar',
      )).to.equal('foo: bar ');
    });
    it('should format with number keys from array args', () => {
      expect(formatString(
        '{0}: {1} {0}',
        'foo',
        'bar',
      )).to.equal('foo: bar foo');
    });
    it('should format with replaceFn', () => {
      expect(formatString(
        '{test1}: {test2} {test1}',
        (key) => `${key}1`,
      )).to.equal('test11: test21 test11');
    });
    it('should format with replaceFn with value', () => {
      expect(formatString(
        '{0}: {1} {0}',
        'foo',
        'bar',
        (key, value, position, allString) => `${value}${position}`,
      )).to.equal('foo0: bar5 foo9');
    });
  });
});
