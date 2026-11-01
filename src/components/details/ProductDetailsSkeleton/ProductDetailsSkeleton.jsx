import styles from './ProductDetailsSkeleton.module.css';

/**
 * ProductDetailsSkeleton renders a two-column placeholder layout with shimmer animation.
 */
export default function ProductDetailsSkeleton() {
  return (
    <div
      className={styles.skeletonContainer}
      data-testid="product-details-skeleton"
      aria-hidden="true"
    >
      {/* Column 1: Image Skeleton */}
      <div className={styles.imageColumn}>
        <div className={styles.imagePlaceholder} />
      </div>

      {/* Column 2: Details & Actions Skeleton */}
      <div className={styles.detailsColumn}>
        <div className={styles.brandLine} />
        <div className={styles.modelLine} />
        <div className={styles.priceLine} />

        <div className={styles.specsBox}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`spec-skeleton-${idx}`} className={styles.specRow}>
              <div className={styles.specLabelLine} />
              <div className={styles.specValueLine} />
            </div>
          ))}
        </div>

        <div className={styles.actionGroup}>
          <div className={styles.actionTitleLine} />
          <div className={styles.actionPills}>
            <div className={styles.pillLine} />
            <div className={styles.pillLine} />
          </div>
        </div>

        <div className={styles.buttonLine} />
      </div>
    </div>
  );
}
