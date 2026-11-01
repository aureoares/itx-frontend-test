import { useState, useEffect, useMemo, useCallback } from 'react';
import { productService } from '../../services/productService';
import SearchBar from '../../components/catalog/SearchBar/SearchBar';
import ProductGrid from '../../components/catalog/ProductGrid/ProductGrid';
import ProductCard from '../../components/catalog/ProductCard/ProductCard';
import ProductSkeleton from '../../components/catalog/ProductSkeleton/ProductSkeleton';
import styles from './ProductList.module.css';

const SKELETON_COUNT = 8;

/**
 * ProductList view renders the main storefront catalog with responsive grid and real-time search.
 */
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = useCallback(async (isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts({ forceRefresh: isRetry });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load product catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await productService.getProducts();
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load product catalog. Please try again.');
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((item) => {
      const brand = (item.brand || '').toLowerCase();
      const model = (item.model || '').toLowerCase();
      return brand.includes(query) || model.includes(query);
    });
  }, [products, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={styles.container} data-testid="product-list-page">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={!loading && !error ? filteredProducts.length : undefined}
      />

      {loading && (
        <ProductGrid>
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <ProductSkeleton key={`skeleton-${idx}`} />
          ))}
        </ProductGrid>
      )}

      {!loading && error && (
        <div className={styles.errorBanner} role="alert">
          <p className={styles.errorMessage}>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => loadProducts(true)}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <ProductGrid>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className={styles.emptyState} role="status">
          {searchQuery.trim() ? (
            <>
              <h2 className={styles.emptyTitle}>No devices found</h2>
              <p className={styles.emptyDescription}>
                No products match your search query &ldquo;{searchQuery.trim()}&rdquo;.
              </p>
              <button
                type="button"
                className={styles.clearSearchButton}
                onClick={handleClearSearch}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h2 className={styles.emptyTitle}>No products available</h2>
              <p className={styles.emptyDescription}>
                There are currently no devices listed in the catalog.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
