import type { Product } from '../../../types/product';

export const buyProduct = async (product: Product) => {
  void product;
  return { id: 'demo_checkout_session' };
};
