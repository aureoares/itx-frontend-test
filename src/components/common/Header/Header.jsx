import { Link } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import CartBadge from '../CartBadge/CartBadge';
import styles from './Header.module.css';

export default function Header({ currentTitle }) {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logoLink} aria-label="Mobile Device Store Home">
            <svg
              className={styles.logoIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span className={styles.logoText}>DeviceStore</span>
          </Link>
          <Breadcrumbs currentTitle={currentTitle} />
        </div>
        <div className={styles.rightSection}>
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
