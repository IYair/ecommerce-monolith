/**
 * product controller
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi: _strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        images: true,
        category: true,
      },
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id: _id } = ctx.params;

    ctx.query = {
      ...ctx.query,
      populate: {
        images: true,
        category: true,
      },
    };

    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },
}));
