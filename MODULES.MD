Simple Module
```
src/modules/module
	- common
		- subModule/
			- api/
			- components/
			- containers/
			- models/
			- stores/				
				- redux-reducers.js
				- redux-selectors.js
				- mobx-stores.js
			- get-components.js
			- routes.js
			- routes.paths.js
			- module-name.js
	- server/
		- subModule/
			- services/
			- mockServices/
			- plugins/
			- mockRoutes/
			- api-routes/
			- module-name.js
    - static/
        - i18n/
            - en/
                - module.js
            - ru/
                - module.js
	- package.json
```

Complex Project Module
```
modules/module/
	- config/
	- build/
	- src/
		- client/
			- init/	
			- runner/
		- common/
			- subModule/
				- api/
				- components/
				- containers/
				- models/
				- stores/				
					- redux-reducers.js
					- redux-selectors.js
					- mobx-stores.js
				- get-components.js
				- routes.js
				- routes.paths.js
				- module-name.js
		- server/
			- init/
			- runner/
			- subModule/
				- services/
				- mockServices/
				- plugins/
				- mockRoutes/
				- api-routes/
        - static/
            - i18n/
                - en/
                    - module.js
                - ru/
                    - module.js
	- clientTest/
		- init/
		- run/
	- serverTest/
		- init/
		- run/
    - static/
        - i18n/
            - en/
                - module.js
            - ru/
                - module.js
- package.json
```
