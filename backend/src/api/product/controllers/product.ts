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

  // Get featured products
  async featured(ctx) {
    ctx.query = {
      ...ctx.query,
      filters: {
        featured: true,
      },
      populate: {
        images: true,
        category: true,
      },
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  // Search products
  async search(ctx) {
    const { q } = ctx.query;

    if (!q) {
      return ctx.badRequest('Search query is required');
    }

    ctx.query = {
      ...ctx.query,
      filters: {
        $or: [{ name: { $containsi: q } }, { description: { $containsi: q } }],
      },
      populate: {
        images: true,
        category: true,
      },
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
