// import {} from '../../../common/app-style/vars';

import serverConfig from '../../server-config';

// from https://codepen.io/cassidoo/pen/KRdLvL
function getStyles() {
  return `
    <style>
      .PreLoader {
        position: absolute;
        height: 100%;
        width: 100%;
        background: #F6F6F6;
        z-index: 1000;
      }
      .PreLoader--inner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .spinner {
        /*margin: 100px auto 0;*/
        width: 100px;
        text-align: center;
      }
      
      .spinner > div {
        width: 18px;
        height: 18px;
        background-color: #7AC74F;
      
        border-radius: 100%;
        display: inline-block;
        -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      }
      
      .spinner .bounce1 {
        -webkit-animation-delay: -0.32s;
        animation-delay: -0.32s;
      }
      
      .spinner .bounce2 {
        -webkit-animation-delay: -0.16s;
        animation-delay: -0.16s;
      }
      
      @-webkit-keyframes sk-bouncedelay {
        0%, 80%, 100% { -webkit-transform: scale(0) }
        40% { -webkit-transform: scale(1.0) }
      }
      
      @keyframes sk-bouncedelay {
        0%, 80%, 100% { 
          -webkit-transform: scale(0);
          transform: scale(0);
        } 40% { 
          -webkit-transform: scale(1.0);
          transform: scale(1.0);
        }
      }
    </style>
  `;
}

function getHtml() {
  return `
    <div id="${serverConfig.common.features.preLoader.domId}" class="PreLoader">
      <div class="PreLoader--inner spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div> 
    </div>
  `;
}

export default function preLoader(state, i18n) {
  return `
    ${getStyles()}
    ${getHtml()}
  `;
}
