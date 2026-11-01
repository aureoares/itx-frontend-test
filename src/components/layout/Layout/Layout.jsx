import { Outlet } from 'react-router-dom';
import Header from '../../common/Header/Header';
import styles from './Layout.module.css';

export default function Layout({ currentTitle }) {
  return (
    <div className={styles.layoutWrapper}>
      <Header currentTitle={currentTitle} />
      <main id="main-content" className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
