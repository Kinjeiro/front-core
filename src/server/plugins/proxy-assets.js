import {
  ASSETS,
  HOT_RELOAD_PREFIX,
} from '../../common/constants/routes.pathes';
import appUrl from '../../common/helpers/app-urls';

export const register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: `/${ASSETS}/{resource*}`,
    handler: (request, reply) => reply.proxy({
      host: options.host,
      port: options.port,
      // protocol: 'http',
    }),
  });

  // Webpack Dev Server Hot replace - http://localhost:8080/8e0c4028f092c675464f.hot-update.json
  server.route({
    method: 'GET',
    // path: '/hot/{hash*}.hot-update.json',
    path: `/${HOT_RELOAD_PREFIX}/{hot*}`,
    handler: (request, reply) => reply.proxy({
      host: options.host,
      port: options.port,
      // protocol: 'http',
    }),
  });

  // todo @ANKU @LOW - подумать как это сделать красивее
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: (request, reply) => reply.proxy({
      // uri: `http://${options.host}:${options.port}${appUrl(ASSETS, 'favicon.ico')}`,
      host: options.host,
      port: options.port,
    }),
  });

  next();
};

register.attributes = {
  name: 'proxy-assets',
};

export default register;
