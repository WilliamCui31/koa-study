const { Product } = require('../model');
const APIError = require('../rest').APIError;

module.exports = {
  'get /api/products': async (ctx, next) => {
    const products = await Product.findAll();
    ctx.rest({ products });
  },

  'post /api/products': async (ctx, next) => {
    const { name, manufacturer, price } = ctx.request.body;
    const product = await Product.create({ name, manufacturer, price });
    ctx.rest(product);
  },

  'delete /api/products/:id': async (ctx, next) => {
    const destroyStatus = await Product.destroy({ where: { id: ctx.params.id } });
    if (destroyStatus) {
      ctx.rest(destroyStatus);
    } else {
      throw new APIError('product: not_found', 'product not found by id');
    }
  }
}