import styles from './ProductSkeleton.module.css';

/**
 * ProductSkeleton renders a placeholder card matching ProductCard dimensions with shimmer effect.
 */
export default function ProductSkeleton() {
  return (
    <div className={styles.skeletonCard} data-testid="product-skeleton" aria-hidden="true">
      <div className={styles.imagePlaceholder} />
      <div className={styles.content}>
        <div className={styles.brandLine} />
        <div className={styles.modelLine} />
        <div className={styles.priceLine} />
      </div>
    </div>
  );
}
