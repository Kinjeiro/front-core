const fs=require("fs"),path=require("path"),{inCoreRoot,inRoot}=require("./path-utils");function requireSafe(a){let b;try{b=require(a)}catch(b){if("MODULE_NOT_FOUND"!==b.code||fs.existsSync(`${a}.js`))throw b;console.log(`Doesn't find in current project module "${a}"`)}return b}function tryLoadProjectFile(a){let b=requireSafe(inRoot(a));if(b||(b=require(inCoreRoot(a))),!b)throw new Error(`Can't load path "${a}"`);return b}module.exports={requireSafe,tryLoadProjectFile};