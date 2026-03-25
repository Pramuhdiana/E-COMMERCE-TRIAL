import type Stripe from "stripe";
import type { Product } from "../../../types/product";

export const transformProduct = ({
  name,
  description,
  price,
  image
}: Product): Stripe.Checkout.SessionCreateParams.LineItem => ({
  name,
  description,
  amount: price,
  currency: 'PLN',
  images: [image],
  quantity: 1
});
