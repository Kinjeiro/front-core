function pluginCodeJsx(a,{inProjectSrc:b,compileNodeModules:c}){const d=b();a.resolve.modules.push(d,"lib","node_modules"),a.resolve.extensions.push("*",".js",".jsx",".web.js",".webpack.js",".styl");const e=c.map(a=>`${a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}\\/`).join("|");a.module.rules.push({test:/\.jsx?$/,loader:"babel-loader",include:[d],exclude:e?new RegExp(`node_modules\\/(?!${e})`):/node_modules\//})}module.exports=pluginCodeJsx;