import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs({ currentTitle }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  // If at root '/', render Home as active
  if (pathnames.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <span className={styles.current} aria-current="page">
              Home
            </span>
          </li>
        </ol>
      </nav>
    );
  }

  const isProductRoute = pathnames[0] === 'product';
  const detailLabel = currentTitle || (isProductRoute ? 'Product Details' : pathnames[pathnames.length - 1]);

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.separator} aria-hidden="true">
            &gt;
          </span>
        </li>
        <li className={styles.breadcrumbItem}>
          <span className={styles.current} aria-current="page">
            {detailLabel}
          </span>
        </li>
      </ol>
    </nav>
  );
}
