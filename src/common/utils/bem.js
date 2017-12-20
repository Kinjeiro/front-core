// https://github.com/albburtsev/bem-cn
import block from 'bem-cn';
import clientConfig from '../client-config';

const separators = clientConfig.common.features.bem.separators;

block.setup({
  el: separators.element,
  mod: separators.modifier,
  modValue: separators.value,
});

export default block;
