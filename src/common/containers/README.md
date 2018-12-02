##Удобный live template для WebStorm для контейнеров

Переменные
```
ClassName
ClassName2 = ClassName
```

Шаблон
```
import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import bemDecorator from '@igs/front-core/lib/common/utils/decorators/bem-component';
import i18n from '@igs/front-core/lib/common/utils/i18n-utils';

// import './$ClassName2$.css';

@connect(
  (state) => ({
  })
)
@bemDecorator($ClassName$)
export default class $ClassName$ extends Component {
  static propTypes = {
  };
  
  static defaultProps = {
  };
  
  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentDidMount() {
  // }
  // componentWillReceiveProps(newProps) {
  // }
  
  
  // ======================================================
  // HANDLERS
  // ======================================================
  
  
  // ======================================================
  // RENDERS
  // ======================================================
  
  
  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      
    } = this.props;
    
    return (
      <div>
        $END$
      </div>
    );
  }
}
```
