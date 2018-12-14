import { ASSETS } from '../../common/constants/routes.pathes';
import {
  joinUri,
  joinPathSimple,
} from '../../common/utils/uri-utils';
import appUrl from '../../common/helpers/app-urls';

// todo @ANKU @LOW - как это протащить правильнее?
const BUILD_DIR = '.build';

export const register = function (server, options, next) {
  // тут реально нужен путь относительно операционки (то есть специфика винды)
  const assetsPath = joinPathSimple(process.cwd(), BUILD_DIR, ASSETS);
  const routePath = joinUri('/', `${ASSETS}/{resource*}`);

  server.route({
    method: 'GET',
    path: routePath,
    config: {
      auth: null,
    },
    handler: {
      directory: {
        path: assetsPath,
        listing: false,
        lookupCompressed: true,
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      proxy: {
        uri: `{protocol}://{host}:{port}${appUrl(ASSETS, 'favicon.ico')}`,
      },
    },
    config: {
      auth: null,
    },
  });
  server.route({
    method: 'GET',
    path: '/robots.txt',
    handler: {
      proxy: {
        uri: `{protocol}://{host}:{port}${appUrl(ASSETS, 'robots.txt')}`,
      },
    },
    config: {
      auth: null,
    },
  });

  next();
};

register.attributes = {
  name: 'static-assets',
};

export default register;
