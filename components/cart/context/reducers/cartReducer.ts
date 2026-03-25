import type { Action, CartItem, State } from "../types";

const calculateTotalPrice = (items: Array<CartItem>) => {
  return items.reduce((acc, curr) => acc + curr.product.price * curr.qty, 0);
};

export const cartReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "addProduct": {
      const newProduct = action.payload;
      const existing = state.items.find((i) => i.product.id === newProduct.id);
      const nextItems = existing
        ? state.items.map((i) =>
            i.product.id === newProduct.id ? { ...i, qty: i.qty + 1 } : i
          )
        : [{ product: newProduct, qty: 1 }, ...state.items];

      return {
        ...state,
        items: nextItems,
        totalPrice: calculateTotalPrice(nextItems),
      };
    }
    case "increaseQty": {
      const nextItems = state.items.map((i) =>
        i.product.id === action.payload.productId ? { ...i, qty: i.qty + 1 } : i
      );
      return { ...state, items: nextItems, totalPrice: calculateTotalPrice(nextItems) };
    }
    case "decreaseQty": {
      const nextItems = state.items
        .map((i) =>
          i.product.id === action.payload.productId ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0);
      return { ...state, items: nextItems, totalPrice: calculateTotalPrice(nextItems) };
    }
    case "removeProduct": {
      const nextItems = state.items.filter((i) => i.product.id !== action.payload.productId);
      return { ...state, items: nextItems, totalPrice: calculateTotalPrice(nextItems) };
    }
    case "clearCart": {
      return {
        ...state,
        items: [],
        totalPrice: 0,
      };
    }

    case "openMenu": {
      return {
        ...state,
        isOpen: true,
      };
    }
    case "closeMenu": {
      return {
        ...state,
        isOpen: false,
      };
    }

    default: {
      throw new Error(`Unhandled action type`);
    }
  }
};
