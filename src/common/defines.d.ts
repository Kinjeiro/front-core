/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="./typings/redux.d.ts"/>
/// <reference path="./typings/react-redux.d.ts"/>
/// <reference path="./typings/redux-thunk.d.ts"/>
/// <reference path="./typings/redux-devtools.d.ts"/>
/// <reference path="./typings/redux-devtools-diff-monitor.d.ts"/>

/// <reference path="./typings/react-dom.d.ts" />
/// <reference path="./typings/bem-cn.d.ts"/>

declare let DEBUG: boolean;

declare module __React {
  interface CSSProperties {
    width?: string;
    height?: string;
    display?: string;
    position?: string;
    padding?: string;
    margin?: string;
    paddingBottom?: string;
    paddingTop?: string;
    paddingLeft?: string;
    paddingRight?: string;
    marginBottom?: string;
    marginTop?: string;
    marginLeft?: string;
    marginRight?: string;
    listStyle?: string;
    color?: string;
    alignSelf?: string;
    backgroundColor?: string;
    flexDirection?: string;
    cursor?: string;
    fontSize?: string;
    transition?: string;
    top?: number;
    maxHeight?: string;
  }

  interface SVGAttributes {
    className?: string;
    text?: string;
  }

  interface JsxClass<P, S> extends Component<P, S> {
    render(): ReactElement<P>;
  }

  interface ReactCtor<P, S> {
    new(props: P, context: any): JsxClass<P, S>;
  }

  interface CommonAttributes extends DOMAttributes {
    ref?: string | ((component: HTMLComponent) => void);
    className?: string | { toString: () => string };
    style?: CSSProperties;
    tabIndex?: number;
    id?: string;
    role?: string;
  }
}

declare var __webpack_public_path__: string;

interface Window {
  passport: {
    runApp: (state: any) => void;
  };
  devToolsExtension: any;
  onReCaptchaLoad: () => void;
  grecaptcha: any;
  am: (event: string, label?: any) => void;
}
