import {
  PATCH_OPERATIONS,
  parseToJsonPatch,
  applyPatchOperations,
  createJsonPatchOperation,
  replacePathIndexToItemId,
} from './api-utils';

describe('api utils', () => {
  describe('[function] parseToJsonPatch', () => {
    it('should parse to json patch format from changed data object', () => {
      expect(parseToJsonPatch({
        field1: 'value1',
        field2: ['value2', 'value3'],
      })).to.deep.equal([
        { op: 'replace', path: '/field1', value: 'value1' },
        { op: 'replace', path: '/field2', value: ['value2', 'value3'] },
      ]);
    });
  });
  describe('[function] applyPatchOperations', () => {
    it('should apply patch operations correct', () => {
      const object = {
        field1: 'value1',
        field2: ['value2', 'value3'],
      };
      expect(applyPatchOperations(object, [
        createJsonPatchOperation('field1', 'newValue1'),
        createJsonPatchOperation('/field2/0', 'newValue2'),
        createJsonPatchOperation('field2/1', null, PATCH_OPERATIONS.REMOVE),
        createJsonPatchOperation('/field2/-', 'newValue4', PATCH_OPERATIONS.ADD),
        createJsonPatchOperation('/field3', 'newFieldValue'),
      ])).to.deep.equal({
        field1: 'newValue1',
        field2: ['newValue2', 'newValue4'],
        field3: 'newFieldValue',
      });
    });
  });
  describe('[function] replacePathIndexToItemId', () => {
    it('should replace by ids', () => {
      const operation = {
        op: 'add',
        path: 'test/111/opa/222/test/333',
        value: 'test',
        itemIds: ['a', 'b', 'c'],
      };
      expect(replacePathIndexToItemId(operation)).to.deep.equal({
        op: 'add',
        path: 'test/a/opa/b/test/c',
        value: 'test',
      });
    });
    it('should replace by ids with incorrect path', () => {
      const operation = {
        op: 'add',
        path: 'test/111/opa/222/333',
        value: 'test',
        itemIds: ['a', 'b', 'c'],
      };
      expect(replacePathIndexToItemId(operation)).to.deep.equal({
        op: 'add',
        path: 'test/a/opa/b/c',
        value: 'test',
      });
    });
    it('should replace path by one id', () => {
      const operation = createJsonPatchOperation(
        'test/111/opa/test',
        'test',
        PATCH_OPERATIONS.REPLACE,
        'a',
      );
      expect(replacePathIndexToItemId(operation)).to.deep.equal({
        op: 'replace',
        path: '/test/a/opa/test',
        value: 'test',
      });
    });
    it('should replace path indexes to number ids', () => {
      const operation = createJsonPatchOperation(
        'test/1/opa/2',
        'test',
        PATCH_OPERATIONS.ADD,
        [3, 4],
      );
      expect(replacePathIndexToItemId(operation)).to.deep.equal({
        op: 'add',
        path: '/test/3/opa/4',
        value: 'test',
      });
    });
  });
});
