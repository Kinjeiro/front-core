import lodashGet from 'lodash/get';
import omit from 'lodash/omit';

import {
  formatString,
} from './format-utils';

describe('format-utils', () => {
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
        (path, value, type, mask, space, position/* , allString */) =>
          `${value}${position}`,
      )).to.equal('foo0: bar5 foo9');
    });
    it('should hide nonWordSeparator if value is empty', () => {
      expect(formatString(
        '{test1}: {test2}, {test3}.. OPA',
        'foo',
        'bar',
      )).to.equal('foo: bar, OPA');
    });
    it('should work with complex mask', () => {
      expect(formatString(
        'Test mask {attr}, {empty}: {innerObj.region} and {innerObj.birthday:date:DD.MM.YY}',
        {
          attr: 'ATTR',
          empty: null,
          innerObj: {
            region: 'REGION',
            birthday: new Date('2018-06-19'),
          },
        },
      )).to.equal('Test mask ATTR, REGION and 19.06.18');
    });
    it('should work with complex mask and custom func', () => {
      const data = {
        attr: 'ATTR',
        empty: null,
        innerObj: {
          region: 'REGION',
          birthday: new Date('2018-06-19'),
        },
      };
      expect(formatString(
        'Test mask {attr}, {empty}: {innerObj.region} and {innerObj.birthday:date:DD.MM.YY}',
        omit(data, 'attr'),
        (path, value, /* type, mask */) => `${value || lodashGet(data, path)}`,
      )).to.equal('Test mask ATTR, null: REGION and 19.06.18');
    });
  });
});
