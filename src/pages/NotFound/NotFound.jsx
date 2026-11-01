import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <span className={styles.errorCode} aria-hidden="true">
        404
      </span>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className={styles.homeLink}>
        Return to Product List
      </Link>
    </div>
  );
}
