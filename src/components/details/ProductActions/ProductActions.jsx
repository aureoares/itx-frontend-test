import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import styles from './ProductActions.module.css';

/**
 * ProductActions component manages device variant selectors (Color, Storage)
 * with mandatory default pre-selection and dispatches the cart addition mutation.
 *
 * @param {object} props
 * @param {object} props.product - Product detail object
 */
export default function ProductActions({ product }) {
  const { addToCart, isMutating } = useCart();

  const colors = product?.options?.colors || [];
  const storages = product?.options?.storages || [];

  const [selectedColor, setSelectedColor] = useState(() => colors[0]?.code ?? null);
  const [selectedStorage, setSelectedStorage] = useState(() => storages[0]?.code ?? null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Synchronize default pre-selections whenever the product changes
  useEffect(() => {
    const defaultColor = product?.options?.colors?.[0]?.code ?? null;
    const defaultStorage = product?.options?.storages?.[0]?.code ?? null;
    setSelectedColor(defaultColor);
    setSelectedStorage(defaultStorage);
    setErrorNotice(null);
    setSuccessNotice(false);
  }, [product]);

  const handleAddToCart = async () => {
    setErrorNotice(null);
    setSuccessNotice(false);

    if (!product?.id) {
      return;
    }

    if (colors.length > 0 && (selectedColor === null || selectedColor === undefined)) {
      setErrorNotice('Please select a color.');
      return;
    }

    if (storages.length > 0 && (selectedStorage === null || selectedStorage === undefined)) {
      setErrorNotice('Please select a storage option.');
      return;
    }

    try {
      await addToCart({
        id: product.id,
        colorCode: selectedColor,
        storageCode: selectedStorage,
      });
      setSuccessNotice(true);
    } catch (err) {
      setErrorNotice(err?.message || 'Failed to add item to cart. Please try again.');
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className={styles.actionsContainer} aria-label="Product Options and Purchase Actions">
      {/* Storage Selector */}
      <div className={styles.selectorGroup}>
        <h3 className={styles.groupTitle} id="storage-selector-label">
          Storage
        </h3>
        <div
          role="radiogroup"
          aria-labelledby="storage-selector-label"
          className={styles.optionsList}
          data-testid="storage-selector"
        >
          {storages.length > 0 ? (
            storages.map((storage) => {
              const isSelected = selectedStorage === storage.code;
              return (
                <button
                  key={`storage-${storage.code}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`${styles.optionPill} ${isSelected ? styles.optionPillActive : ''}`}
                  onClick={() => {
                    setSelectedStorage(storage.code);
                    setErrorNotice(null);
                  }}
                >
                  {storage.name}
                </button>
              );
            })
          ) : (
            <span className={styles.emptyOptionNotice}>No storage options available</span>
          )}
        </div>
      </div>

      {/* Color Selector */}
      <div className={styles.selectorGroup}>
        <h3 className={styles.groupTitle} id="color-selector-label">
          Color
        </h3>
        <div
          role="radiogroup"
          aria-labelledby="color-selector-label"
          className={styles.optionsList}
          data-testid="color-selector"
        >
          {colors.length > 0 ? (
            colors.map((color) => {
              const isSelected = selectedColor === color.code;
              return (
                <button
                  key={`color-${color.code}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`${styles.optionPill} ${isSelected ? styles.optionPillActive : ''}`}
                  onClick={() => {
                    setSelectedColor(color.code);
                    setErrorNotice(null);
                  }}
                >
                  {color.name}
                </button>
              );
            })
          ) : (
            <span className={styles.emptyOptionNotice}>No color options available</span>
          )}
        </div>
      </div>

      {/* Error / Alert notification */}
      {errorNotice && (
        <div className={styles.errorBanner} role="alert" data-testid="cart-error-banner">
          <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Success notification */}
      {successNotice && (
        <div className={styles.successBanner} role="status" data-testid="cart-success-banner">
          <span className={styles.successIcon} aria-hidden="true">✓</span>
          <span>Added to your cart!</span>
        </div>
      )}

      {/* Add Button CTA */}
      <button
        type="button"
        className={styles.addButton}
        disabled={isMutating || !product}
        onClick={handleAddToCart}
        aria-busy={isMutating}
        data-testid="add-to-cart-button"
      >
        {isMutating ? (
          <span className={styles.buttonContent}>
            <span className={styles.spinner} aria-hidden="true" />
            Adding...
          </span>
        ) : (
          'Add to cart'
        )}
      </button>
    </div>
  );
}
