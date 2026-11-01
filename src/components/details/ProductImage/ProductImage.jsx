import { useState, useEffect } from 'react';
import styles from './ProductImage.module.css';

/**
 * ProductImage renders the primary visual representation of a device with error fallback.
 *
 * @param {object} props
 * @param {string} [props.imgUrl] - URL of device photo
 * @param {string} [props.alt='Product Image'] - Accessible alt description
 */
export default function ProductImage({ imgUrl, alt = 'Product Image' }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imgUrl]);

  return (
    <div className={styles.imageContainer} data-testid="product-image-container">
      {!imageError && imgUrl ? (
        <img
          src={imgUrl}
          alt={alt}
          className={styles.image}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={styles.placeholder}
          data-testid="product-image-fallback"
          aria-label="No image available"
        >
          <svg
            width="64"
            height="64"
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
  );
}
