const http = require('node:http');
const { URL } = require('node:url');
const { assertRequiredEnv, env } = require('./_config');
const { sendJson } = require('./_http');
const upload = require('./upload');
const chat = require('./chat');
const sync = require('./sync');
const files = require('./files');

const routes = {
  'POST /api/upload': upload.handler,
  'POST /api/chat': chat.handler,
  'POST /api/sync': sync.handler,
  'GET /api/files': files.handler
};

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  const key = `${req.method} ${pathname}`;
  const route = routes[key];

  if (!route) {
    return sendJson(res, 404, { error: 'Not found' });
  }

  return route(req, res);
});

try {
  assertRequiredEnv();
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`n8n RAG API listening on :${env.PORT}`);
  });
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exit(1);
}
