// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';

// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse
var checkRateLimit = require('./lib/rate-limit')(
  process.env.CORSANYWHERE_RATELIMIT
);

var cors_proxy = require('./lib/cors-anywhere');

cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,

  // Permitir peticiones directas sin exigir Origin/X-Requested-With
  requireHeader: [],

  checkRateLimit: checkRateLimit,

  // Headers que no se deben reenviar
  removeHeaders: [
    'cookie',
    'cookie2',

    // Headers específicos de Heroku
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',

    // No eliminar estos:
    // origin
    // referer
    // user-agent
  ],

  redirectSameOrigin: true,

  httpProxyOptions: {
    // Headers enviados al servidor de destino
    headers: {
      Origin: 'https://www.izzigo.tv',
      Referer: 'https://www.izzigo.tv/',
    },

    // No agregar X-Forwarded-For
    xfwd: false,
  },

}).listen(port, host, function() {
  console.log(
    'Running CORS Anywhere on ' + host + ':' + port
  );
});
