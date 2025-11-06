/**
 * product controller
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    // Populate images and category by default
    ctx.query = {
      ...ctx.query,
      populate: {
        images: true,
        category: {
          populate: ['image'],
        },
      },
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    ctx.query = {
      ...ctx.query,
      populate: {
        images: true,
        category: {
          populate: ['image'],
        },
      },
    };

    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },

  // Custom endpoint to get featured products
  async featured(ctx) {
    try {
      const limit = ctx.query.limit ? parseInt(ctx.query.limit as string, 10) : 10;

      const products = await strapi.entityService.findMany('api::product.product', {
        filters: {
          featured: true,
        },
        populate: {
          images: true,
          category: {
            populate: ['image'],
          },
        },
        publicationState: 'live',
        limit: limit,
      });

      return { data: products };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Custom endpoint to search products
  async search(ctx) {
    try {
      const query = ctx.request.query.query as string;
      const limit = ctx.query.limit ? parseInt(ctx.query.limit as string, 10) : 20;

      if (!query) {
        return { data: [] };
      }

      const products = await strapi.entityService.findMany('api::product.product', {
        filters: {
          $or: [
            { name: { $containsi: query } },
            { description: { $containsi: query } },
            { sku: { $containsi: query } },
          ],
        },
        populate: {
          images: true,
          category: {
            populate: ['image'],
          },
        },
        publicationState: 'live',
        limit: limit,
      });

      return { data: products };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
