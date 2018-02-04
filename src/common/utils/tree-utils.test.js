import {
  arrayToTree,
  treeToArray,
} from './tree-utils';

describe('tree-utils utils', () => {
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

  describe('[function] treeToArray', () => {
    it('should find only leafs', () => {
      expect(treeToArray(
        {
          id: '1',
          children: [
            {
              id: '1_1',
              children: [
                {
                  id: '1_1_1',
                },
              ],
            },
            {
              id: '1_2',
              children: [],
            },
          ],
        },
      )).to.deep.equal([
        {
          id: '1_1_1',
        },
        {
          id: '1_2',
          children: [],
        },
      ]);
    });
  });
});
