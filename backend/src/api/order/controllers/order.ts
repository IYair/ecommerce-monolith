/**
 * order controller
 */
import { factories } from '@strapi/strapi';
import Stripe from 'stripe';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async find(ctx) {
    // Only allow authenticated users to see their own orders
    if (ctx.state.user) {
      const existingFilters = (ctx.query.filters as Record<string, unknown>) || {};
      ctx.query = {
        ...ctx.query,
        filters: {
          ...existingFilters,
          userId: ctx.state.user.id,
        },
      };
    } else {
      // Unauthenticated users can't see orders
      return { data: [], meta: {} };
    }

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Get the order first to check ownership
    const order = await strapi.entityService.findOne('api::order.order', id);

    if (!order) {
      return ctx.notFound('Order not found');
    }

    // Check if user owns this order
    if (ctx.state.user && order.userId !== ctx.state.user.id) {
      return ctx.forbidden('You do not have permission to view this order');
    }

    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },

  // Create order from Stripe session
  async createFromStripe(ctx) {
    try {
      const { sessionId } = ctx.request.body;

      if (!sessionId) {
        return ctx.badRequest('Session ID is required');
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-10-29.clover',
      });
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'customer'],
      });

      if (session.payment_status !== 'paid') {
        return ctx.badRequest('Payment not completed');
      }

      // Check if order already exists
      const existingOrder = await strapi.entityService.findMany('api::order.order', {
        filters: {
          stripeSessionId: sessionId,
        },
        limit: 1,
      });

      if (existingOrder && existingOrder.length > 0) {
        return { data: existingOrder[0] };
      }

      // Create order
      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        status: 'processing' as const,
        items: session.metadata?.items ? JSON.parse(session.metadata.items) : [],
        subtotal: (session.amount_subtotal ?? 0) / 100,
        tax: (session.total_details?.amount_tax ?? 0) / 100,
        shipping: (session.total_details?.amount_shipping ?? 0) / 100,
        total: (session.amount_total ?? 0) / 100,
        shippingAddress: session.metadata?.shippingAddress
          ? JSON.parse(session.metadata.shippingAddress)
          : {},
        stripeSessionId: sessionId,
        stripePaymentIntentId: session.payment_intent as string,
        customerEmail: session.customer_details?.email,
        userId: ctx.state.user?.id,
        publishedAt: new Date(),
      };

      const order = await strapi.entityService.create('api::order.order', {
        data: orderData,
      });

      return { data: order };
    } catch (err) {
      console.error('Create order error:', err);
      ctx.throw(500, err);
    }
  },
}));
