import { formatPrice } from '../../../utils/formatters';
import { buildSpecificationItems } from '../../../utils/attributeFormatters';
import styles from './ProductDescription.module.css';

/**
 * ProductDescription renders device identity, price, and technical specifications table.
 *
 * @param {object} props
 * @param {object} props.product - Product detail object
 */
export default function ProductDescription({ product }) {
  if (!product) {
    return null;
  }

  const { brand = '', model = '', price } = product;
  const formattedPrice = formatPrice(price);
  const specItems = buildSpecificationItems(product);

  return (
    <section className={styles.descriptionSection} aria-label="Product Specifications">
      <div className={styles.header}>
        <p className={styles.brand}>{brand}</p>
        <h1 className={styles.model}>{model}</h1>
        <p className={styles.price}>{formattedPrice}</p>
      </div>

      <div className={styles.specsContainer}>
        <h2 className={styles.specsTitle}>Technical Specifications</h2>
        <dl className={styles.specsList} data-testid="specifications-list">
          {specItems.map((item) => (
            <div key={item.key} className={styles.specRow}>
              <dt className={styles.specLabel}>{item.label}</dt>
              <dd className={styles.specValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
