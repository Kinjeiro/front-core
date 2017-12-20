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

