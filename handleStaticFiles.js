const fs = require('mz/fs');
const path = require('path');
const mime = require('mime');

function handleStaticFiles(dir) {
  return async (ctx, next) => {
    const rpath = ctx.request.path;
    if (rpath.startsWith(dir)) {
      const filePath = path.join(__dirname, rpath);
      if (await fs.exists(filePath)) {
        ctx.response.type = mime.getType(rpath);
        ctx.response.body = await fs.readFile(filePath);
      } else {
        ctx.response.status = '404';
      }
    } else {
      await next();
    }
  };
}

module.exports = handleStaticFiles;
