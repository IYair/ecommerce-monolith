export default {
  routes: [
    {
      method: 'GET',
      path: '/products/featured',
      handler: 'product.featured',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/search',
      handler: 'product.search',
      config: {
        auth: false,
      },
    },
  ],
};
