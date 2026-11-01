import { useParams } from 'react-router-dom';

export default function ProductDetails() {
  const { id } = useParams();
  return (
    <div data-testid="product-details-page">
      <h1>Product Details</h1>
      <p>Details for product: {id}</p>
    </div>
  );
}
