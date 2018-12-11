import each from 'lodash/each';
import forOwn from 'lodash/forOwn';
import isObject from 'lodash/isObject';

// todo @ANKU @LOW @BUG_OUT @react-scroll - у них в методе не учитывает fixed а ведь именно от него зависит получение скролла от элемента
export function getScrollParent(element, includeHidden) {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

  // if (style.position === "fixed") {
  //   return document;
  // }
  for (let parent = element; parent = parent.parentElement;) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      continue;
    }
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
  }

  return document;
}

function createHiddenInput(name, value) {
  const input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('name', name);
  input.setAttribute('value', value);
  return input;
}

function appendInput(form, name, value) {
  if (Array.isArray(value)) {
    each(value, (v, i) => {
      appendInput(form, `${name}[${i}]`, v);
    });
  } else if (isObject(value)) {
    forOwn(value, (v, p) => {
      appendInput(form, `${name}[${p}]`, v);
    });
  } else {
    form.appendChild(createHiddenInput(name, value));
  }
}

// https://stackoverflow.com/a/37171171/344172
/**
 *
 * @param url
 * @param data
 * @param newWindow - при банк эквейринге (оплате через банк) нужно открывать
 * @param encoding
 */
export function postFormToUrl(url, data, encoding = 'UTF-8', newWindow = false) {
  const form = document.createElement('form');
  document.body.appendChild(form);
  form.setAttribute('method', 'post');
  if (newWindow) {
    form.setAttribute('target', '_blank');
  }
  form.setAttribute('action', url);
  form.setAttribute('accept-charset', encoding);

  forOwn(data, (value, name) => appendInput(form, name, value));

  form.submit();
}

