import {
  PATCH_OPERATIONS,
  parseToJsonPatch,
  applyPatchOperations,
  createJsonPatchOperation,
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
});
