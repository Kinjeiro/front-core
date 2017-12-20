import { ASSETS } from '../../common/constants/routes.pathes';

export const register = function (server, options, next) {
  const handler = function (request, reply) {
    return reply.proxy({
      host: options.host,
      port: options.port,
      protocol: 'http',
    });
  };

  server.route({
    method: 'GET',
    path: `/${ASSETS}/{resource*}`,
    handler,
  });

  // todo @ANKU @LOW - подумать как это сделать красивее
  server.route({
    method: 'GET',
    path: `/favicon.ico`,
    handler: (request, reply) => reply.proxy({
      uri: `http://${options.host}:${options.port}/${ASSETS}/favicon.ico`,
    }),
  });

  next();
};

register.attributes = {
  name: 'proxy-assets',
};

export default register;
