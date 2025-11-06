export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/create-from-stripe',
      handler: 'order.createFromStripe',
      config: {
        auth: false,
      },
    },
  ],
};
