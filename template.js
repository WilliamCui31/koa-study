const nunjucks = require('nunjucks');

function createEnv(
  path,
  { noCache = false, watch = false, autoescape = true, throwOnUndefined = false }
) {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path || 'views', { noCache, watch }),
    {
      autoescape,
      throwOnUndefined
    }
  );
  return env;
}

function template(path, opts) {
  const env = createEnv(path, opts);
  return async (ctx, next) => {
    ctx.render = function(view, model) {
      ctx.response.type = 'text/html';
      ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
    };

    await next();
  };
}

module.exports = template;
