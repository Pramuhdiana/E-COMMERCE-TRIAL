import type { Product } from "../../../types/product";

export type CartItem = {
  readonly product: Product;
  readonly qty: number;
};

export type Action =
  | { type: "addProduct"; payload: Product }
  | { type: "increaseQty"; payload: { productId: string } }
  | { type: "decreaseQty"; payload: { productId: string } }
  | { type: "removeProduct"; payload: { productId: string } }
  | { type: "clearCart" }
  | { type: "openMenu" }
  | { type: "closeMenu" };

export type State = {
  readonly items: Array<CartItem>;
  readonly totalPrice: number;
  readonly isOpen: boolean;
};
