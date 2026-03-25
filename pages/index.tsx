import { Products } from '../components/products/Products';
import { Checkout } from '../components/cart/Checkout';
import { Layout } from '../components/layout/Layout';

export default function Home() {
  return (
    <Layout>
      <Products />
      <Checkout />
    </Layout>
  );
}
