module.exports = {
  APIError: (code, message) => {
    this.code = code || 'Internal: unknown_error';
    this.message = message || '';
  },
  restify: (pathPrefix = '/api/') => {
    return async (ctx, next) => {
      const { path, method, url } = ctx.request;
      if (path.startsWith(pathPrefix)) {
        console.log(`Process API ${method} ${url} ...`);
        ctx.rest = (data) => {
          ctx.response.type = 'application/json';
          ctx.response.body = data;
        }
        try {
          await next();
        } catch (e) {
          console.log('Process API Error ...');
          ctx.response.status = 400;
          ctx.response.type = 'application/json';
          ctx.response.body = {
            code: e.code || 'Internal: unknown_error',
            message: e.message || ''
          }
        }
      } else {
        await next();
      }
    }
  }
}