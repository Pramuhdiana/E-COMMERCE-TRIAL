import * as y from "yup";
import type { Product, ProductCategory } from "../../../types/product";

export const productSchema: y.SchemaOf<Product> = y.object().shape({
  id: y.string().required(),
  description: y.string().required(),
  name: y.string().required(),
  price: y.number().required(),
  image: y.string().required(),
  category: y
    .mixed<ProductCategory>()
    .oneOf(["entry-gaming", "esports", "aaa", "creator-gaming", "thin-gaming"])
    .required(),
  stock: y.number().required().integer().min(0),
});

export const productsSchema = y.array(productSchema);
