import styles from './ProductGrid.module.css';

/**
 * ProductGrid renders a responsive CSS grid container displaying items (cards or skeletons).
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function ProductGrid({ children, className = '' }) {
  return (
    <section
      className={`${styles.grid} ${className}`.trim()}
      data-testid="product-grid"
      aria-label="Product catalog grid"
    >
      {children}
    </section>
  );
}
