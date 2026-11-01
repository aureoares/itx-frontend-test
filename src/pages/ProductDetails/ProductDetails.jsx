import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductImage from '../../components/details/ProductImage/ProductImage';
import ProductDescription from '../../components/details/ProductDescription/ProductDescription';
import ProductActions from '../../components/details/ProductActions/ProductActions';
import ProductDetailsSkeleton from '../../components/details/ProductDetailsSkeleton/ProductDetailsSkeleton';
import styles from './ProductDetails.module.css';

/**
 * ProductDetails view renders the two-column specifications, selectors, and cart mutation interface.
 */
export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (isRetry = false) => {
    if (!id) {
      setError({ message: 'Device ID is required', isNotFound: true });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await productService.getProductById(id, { forceRefresh: isRetry });
      if (!data || !data.id) {
        setError({
          message: 'Device not found. The device you are looking for does not exist or may have been removed.',
          isNotFound: true,
        });
      } else {
        setProduct(data);
      }
    } catch (err) {
      const is404 = err?.status === 404 || /not found/i.test(err?.message || '');
      setError({
        message: is404
          ? 'Device not found. The device you are looking for does not exist or may have been removed.'
          : (err?.message || 'Failed to load device specifications. Please try again.'),
        isNotFound: is404,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!id) {
        if (isMounted) {
          setError({ message: 'Device ID is required', isNotFound: true });
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await productService.getProductById(id);
        if (isMounted) {
          if (!data || !data.id) {
            setError({
              message: 'Device not found. The device you are looking for does not exist or may have been removed.',
              isNotFound: true,
            });
          } else {
            setProduct(data);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const is404 = err?.status === 404 || /not found/i.test(err?.message || '');
          setError({
            message: is404
              ? 'Device not found. The device you are looking for does not exist or may have been removed.'
              : (err?.message || 'Failed to load device specifications. Please try again.'),
            isNotFound: is404,
          });
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className={styles.container} data-testid="product-details-page">
      {/* Navigation Back Link */}
      <nav aria-label="Page navigation" className={styles.navContainer}>
        <Link to="/" className={styles.backLink} aria-label="Return to device catalog">
          <span aria-hidden="true">←</span> Back to devices
        </Link>
      </nav>

      {/* Loading Skeleton */}
      {loading && <ProductDetailsSkeleton />}

      {/* Error & 404 State */}
      {!loading && error && (
        <div
          className={styles.errorContainer}
          role="alert"
          data-testid={error.isNotFound ? 'pdp-not-found' : 'pdp-error'}
        >
          <div className={styles.errorIcon} aria-hidden="true">
            {error.isNotFound ? '📱❓' : '⚠️'}
          </div>
          <h2 className={styles.errorTitle}>
            {error.isNotFound ? 'Device Not Found' : 'Unable to Load Device'}
          </h2>
          <p className={styles.errorMessage}>{error.message}</p>
          <div className={styles.errorActions}>
            {!error.isNotFound && (
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => fetchProduct(true)}
              >
                Retry
              </button>
            )}
            <Link to="/" className={styles.returnButton}>
              Return to Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Two-Column Details Presentation */}
      {!loading && !error && product && (
        <div className={styles.twoColumnGrid}>
          {/* Column 1: Image */}
          <div className={styles.imageColumn}>
            <ProductImage
              imgUrl={product.imgUrl}
              alt={`${product.brand || ''} ${product.model || ''}`.trim() || 'Product Image'}
            />
          </div>

          {/* Column 2: Specs & Actions */}
          <div className={styles.detailsColumn}>
            <ProductDescription product={product} />
            <ProductActions product={product} />
          </div>
        </div>
      )}
    </div>
  );
}
