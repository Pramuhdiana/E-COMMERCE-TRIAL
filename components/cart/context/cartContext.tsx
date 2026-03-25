import {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { cartReducer } from "./reducers/cartReducer";
import type { Action, State } from "./types";
import type { Product } from "../../../types/product";
import type { CartItem } from "./types";

type Dispatch = (action: Action) => void;
type CartProviderProps = { readonly children: React.ReactNode };

export const CartStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const initialState: State = { items: [], totalPrice: 0, isOpen: false };
const LS_CART = "ecommerce.cart.v1";

function calculateTotalPrice(items: Array<CartItem>) {
  return items.reduce((acc, curr) => acc + curr.product.price * curr.qty, 0);
}

function loadInitialState(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(LS_CART);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as { items?: Array<CartItem>; products?: Array<Product> };
    // migrasi dari versi lama: { products: Product[] }
    const items = Array.isArray(parsed?.items)
      ? parsed.items
      : Array.isArray(parsed?.products)
        ? parsed.products.map((p) => ({ product: p, qty: 1 }))
        : [];
    return { items, totalPrice: calculateTotalPrice(items), isOpen: false };
  } catch {
    return initialState;
  }
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadInitialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_CART, JSON.stringify({ items: state.items }));
    } catch {
      // ignore
    }
  }, [state.items]);

  return (
    <CartStateContext.Provider value={value}>
      {children}
    </CartStateContext.Provider>
  );
};
