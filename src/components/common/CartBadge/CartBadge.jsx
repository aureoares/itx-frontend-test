import { useCart } from '../../../context/CartContext';
import styles from './CartBadge.module.css';

export default function CartBadge() {
  const { cartCount } = useCart();
  const accessibleLabel =
    cartCount === 0
      ? 'Shopping cart is empty, 0 items'
      : `Shopping cart: ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`;

  return (
    <div
      className={styles.cartContainer}
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <svg
        className={styles.cartIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className={styles.badge} data-testid="cart-badge-count">
        {cartCount}
      </span>
    </div>
  );
}
