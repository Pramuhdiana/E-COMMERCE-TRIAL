import { CartItem } from "./CartItem";
import type { CartItem as CartItemType } from "./context/types";

type CartItemsProps = {
  readonly items: Array<CartItemType>;
};

export const CartItems = ({ items }: CartItemsProps) => (
  <ul className="-my-6 divide-y divide-gray-200">
    {items.map((item) => (
      <CartItem key={item.product.id} item={item} />
    ))}
  </ul>
);
