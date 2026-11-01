import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout/Layout';
import ProductList from '../pages/ProductList/ProductList';
import ProductDetails from '../pages/ProductDetails/ProductDetails';
import NotFound from '../pages/NotFound/NotFound';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <Layout>
        <NotFound />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <ProductList />,
      },
      {
        path: 'product/:id',
        element: <ProductDetails />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
