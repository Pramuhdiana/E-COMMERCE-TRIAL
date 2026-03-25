import type { CartItem } from "../cart/context/types";

export type OrderItem = {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly qty: number;
};

export type Order = {
  readonly id: string;
  readonly userId: string;
  readonly phone: string;
  readonly items: ReadonlyArray<OrderItem>;
  readonly totalPrice: number;
  readonly createdAt: number;
};

const LS_ORDERS = "ecommerce.orders.v1";

type OrdersMap = Record<string, Array<Order>>;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadAll(): OrdersMap {
  if (typeof window === "undefined") return {};
  const parsed = safeJsonParse<OrdersMap>(localStorage.getItem(LS_ORDERS));
  return parsed && typeof parsed === "object" ? parsed : {};
}

function saveAll(map: OrdersMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ORDERS, JSON.stringify(map));
}

export function createOrderFromCartItems(input: {
  readonly userId: string;
  readonly phone: string;
  readonly items: ReadonlyArray<CartItem>;
}): Order {
  const items: Array<OrderItem> = input.items.map((i) => ({
    productId: i.product.id,
    name: i.product.name,
    price: i.product.price,
    qty: i.qty,
  }));
  const totalPrice = items.reduce((acc, it) => acc + it.price * it.qty, 0);

  return {
    id: `o-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: input.userId,
    phone: input.phone,
    items,
    totalPrice,
    createdAt: Date.now(),
  };
}

export function appendOrder(order: Order) {
  const map = loadAll();
  const next = { ...map, [order.userId]: [order, ...(map[order.userId] ?? [])] };
  saveAll(next);
}

export function loadOrders(userId: string): Array<Order> {
  const map = loadAll();
  return map[userId] ?? [];
}

export async function appendOrderToServer(order: Order) {
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  } catch {
    // Abaikan error agar mode FE-only tetap jalan.
  }
}

