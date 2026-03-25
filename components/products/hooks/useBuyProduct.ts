import { useMutation } from 'react-query';
import type { Product } from '../../../types/product';
import { buyProduct } from '../api/buyProduct';
import { redirectToCheckout } from '../../../utils/stripe';

export const useBuyProduct = () => {
  return useMutation((product: Product) => buyProduct(product), {
    onSuccess: redirectToCheckout,
  });
};
