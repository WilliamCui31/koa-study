const fs = require('fs');

function addMapping(router, mapping) {
  for (let url in mapping) {
    const [method, path] = url.split(' ');
    if (router[method]) {
      router[method](path, mapping[url]);
      console.log(`register url mapping: ${method} ${path}`);
    } else {
      console.log(`invalid url: ${url}`);
    }
  }
}

function addControllers(router, dir = '/controllers') {
  const files = fs.readdirSync(__dirname + dir);
  const js_files = files.filter(file => file.endsWith('.js'));
  js_files.forEach(file => {
    const mapping = require(__dirname + dir + '/' + file);
    addMapping(router, mapping);
  });
  return router.routes();
}

module.exports = addControllers;
