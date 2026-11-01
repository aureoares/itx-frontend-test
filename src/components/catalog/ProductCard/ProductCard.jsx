import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatters';
import styles from './ProductCard.module.css';

/**
 * ProductCard component renders an individual mobile device item card.
 *
 * @param {object} props
 * @param {object} props.product
 * @param {string} props.product.id
 * @param {string} [props.product.brand]
 * @param {string} [props.product.model]
 * @param {string | number} [props.product.price]
 * @param {string} [props.product.imgUrl]
 */
export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return null;
  }

  const { id, brand = '', model = '', price, imgUrl } = product;
  const formattedPrice = formatPrice(price);
  const title = `${brand} ${model}`.trim() || 'Mobile Device';

  return (
    <article className={styles.card}>
      <Link
        to={`/product/${id}`}
        className={styles.cardLink}
        aria-label={`${title}, ${formattedPrice}`}
      >
        <div className={styles.imageContainer}>
          {!imageError && imgUrl ? (
            <img
              src={imgUrl}
              alt={title}
              className={styles.image}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={styles.imagePlaceholder}
              data-testid="product-image-fallback"
              aria-label="No image available"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.placeholderIcon}
                aria-hidden="true"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.brand}>{brand}</p>
          <h2 className={styles.model}>{model}</h2>
          <p className={styles.price}>{formattedPrice}</p>
        </div>
      </Link>
    </article>
  );
}
