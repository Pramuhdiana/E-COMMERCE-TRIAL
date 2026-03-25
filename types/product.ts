export type ProductCategory =
  | "entry-gaming"
  | "esports"
  | "aaa"
  | "creator-gaming"
  | "thin-gaming";

export type Product = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number; // cents
  readonly image: string; // public/ path (e.g. /assets/products/foo.jpg)
  readonly category: ProductCategory;
  readonly stock: number;
};

