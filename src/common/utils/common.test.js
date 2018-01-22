import {
  includes,
  arrayToTree,
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

  describe('[function] arrayToTree', () => {
    it('should parse to correct tree', () => {
      const array = [
        { id: 1 },
        { id: 2, parentId: 1 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 2 },
        { id: 5 },
        { id: 6, parentId: null },
        { id: 7, parentId: 4, testField: 'testValue' },
      ];

      expect(arrayToTree(array)).to.deep.equal([
        {
          id: 1,
          parentId: null,
          level: 0,
          children: [
            {
              id: 2,
              parentId: 1,
              level: 1,
              children: [
                {
                  id: 4,
                  parentId: 2,
                  level: 2,
                  children: [
                    {
                      id: 7,
                      parentId: 4,
                      level: 3,
                      children: [],
                      testField: 'testValue',
                    },
                  ],
                },
              ],
            },
            {
              id: 3,
              parentId: 1,
              level: 1,
              children: [],
            },
          ],
        },
        {
          id: 5,
          parentId: null,
          level: 0,
          children: [],
        },
        {
          id: 6,
          parentId: null,
          level: 0,
          children: [],
        },
      ]);
    });
  });
});
