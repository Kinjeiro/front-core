import lodashGet from 'lodash/get';

import {
  findInTree,
  arrayToTree,
  treeToArray,
  EQUAL_CONSTRAINTS,
} from './tree-utils';

describe('tree-utils utils', () => {
  describe('[function] findInTree', () => {
    const tree = {
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
                  testField: 'testValue 7',
                },
              ],
            },
            {
              id: 5,
              parentId: 2,
              level: 2,
              children: [
                {
                  id: 8,
                  parentId: 5,
                  level: 3,
                  children: [],
                  testField: 'anyValue 8',
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
    };

    it('should search in tree', () => {
      expect(findInTree(tree, 8)).to.deep.equal({
        result: lodashGet(tree, 'children.0.children.1.children.0'),
        pathStr: 'children.0.children.1.children.0',
        isRoot: false,
      });
    });
    it('should search id in tree by string', () => {
      expect(findInTree(tree, '4')).to.deep.equal({
        result: lodashGet(tree, 'children.0.children.0'),
        pathStr: 'children.0.children.0',
        isRoot: false,
      });
    });
    it('should n\'t search in tree', () => {
      expect(findInTree(tree, 11111)).to.deep.equal({
        result: undefined,
        pathStr: '',
        isRoot: false,
      });
    });
    it('should search by change "fieldSearch" options', () => {
      expect(findInTree(
        tree,
        'anyValue 8',
        {
          fieldSearch: 'testField',
        },
      )).to.deep.equal({
        result: lodashGet(tree, 'children.0.children.1.children.0'),
        pathStr: 'children.0.children.1.children.0',
        isRoot: false,
      });
    });
    it('should search by "equalConstraint" options = EQUAL_CONSTRAINTS.CONTAINS', () => {
      expect(findInTree(
        tree,
        'Value 8',
        {
          fieldSearch: 'testField',
          equalConstraint: EQUAL_CONSTRAINTS.CONTAINS,
        },
      )).to.deep.equal({
        result: lodashGet(tree, 'children.0.children.1.children.0'),
        pathStr: 'children.0.children.1.children.0',
        isRoot: false,
      });
    });
    it('should search by "equalConstraint" options = EQUAL_CONSTRAINTS.START_WITH', () => {
      expect(findInTree(
        tree,
        'any',
        {
          fieldSearch: 'testField',
          equalConstraint: EQUAL_CONSTRAINTS.START_WITH,
        },
      )).to.deep.equal({
        result: lodashGet(tree, 'children.0.children.1.children.0'),
        pathStr: 'children.0.children.1.children.0',
        isRoot: false,
      });
    });

    it('should search by filter function', () => {
      expect(findInTree(tree, ({ testField }) => testField === 'anyValue 8')).to.deep.equal({
        result: lodashGet(tree, 'children.0.children.1.children.0'),
        pathStr: 'children.0.children.1.children.0',
        isRoot: false,
      });
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
