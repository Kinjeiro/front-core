## Шаблон для Webstorm по созданию redux
Переменные
```
PREFIX
TYPE
methodName
entityNameSmall = camelCase(entityName)
```

Шаблон
```
import { createReducer } from '@igs/front-core/lib/common/app-redux/utils';
import { createStatusReducer } from '@igs/front-core/lib/common/app-redux/helpers';

// ======================================================
// INITIAL STATE
// ======================================================
const initialState = {
  $entityNameSmall$: null,
  $entityNameSmall$Status: undefined
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = '$PREFIX$';
export const TYPES = {
  $TYPE$_FETCH:     `${PREFIX}/$TYPE$_FETCH`,
  $TYPE$_FAIL:      `${PREFIX}/$TYPE$_FAIL`,
  $TYPE$_SUCCESS:   `${PREFIX}/$TYPE$_SUCCESS`
};


// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  action$methodName$(api$methodName$) {
    return {
      types: [TYPES.$TYPE$_FETCH, TYPES.$TYPE$_SUCCESS, TYPES.$TYPE$_FAIL],
      payload: api$methodName$()
    };
  }
};

export function getBindActions({
  api$methodName$
}) {
  return {
    ...actions,
    action$methodName$: actions.action$methodName$.bind(this, api$methodName$)
  };
}

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    [TYPES.$TYPE$_SUCCESS]:
      (state, action, $entityNameSmall$) => ({
        ...state,
        $entityNameSmall$$END$
      })
  },
  {
    $entityNameSmall$Status: createStatusReducer(
      TYPES.$TYPE$_FETCH, TYPES.$TYPE$_SUCCESS, TYPES.$TYPE$_FAIL
    )
  }
);

export default reducer;
```


##ШАБЛОН для Redux Action with Promise (RAP)

ПЕРЕМЕННЫЕ
```
typeName
param
variableSmall
TYPE_UPPER = capitalizeAndUnderscore(typeName)
``` 
 
ШАБЛОН 
 ```
 action$typeName$(api$typeName$, $param$$END$) {
   return {
     $variableSmall$: null,
     status$typeName$: undefined,
     
     $TYPE_UPPER$_FETCH:     `${PREFIX}/$TYPE_UPPER$_FETCH`,
     $TYPE_UPPER$_SUCCESS:   `${PREFIX}/$TYPE_UPPER$_SUCCESS`,
     $TYPE_UPPER$_FAIL:      `${PREFIX}/$TYPE_UPPER$_FAIL`,
     
     action$typeName$: actions.action$typeName$.bind(this, api$typeName$),
     
     [TYPES.$TYPE_UPPER$_SUCCESS]:
       (state, action, $variableSmall$) => ({
         ...state,
         $variableSmall$
       }),
       
     status$typeName$: createStatusReducer(
       TYPES.$TYPE_UPPER$_FETCH, TYPES.$TYPE_UPPER$_SUCCESS, TYPES.$TYPE_UPPER$_FAIL
     ),
   
     types: [TYPES.$TYPE_UPPER$_FETCH, TYPES.$TYPE_UPPER$_SUCCESS, TYPES.$TYPE_UPPER$_FAIL],
     payload: api$typeName$($param$)
   };
 },
 ```
