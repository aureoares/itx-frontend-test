import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDescription from './ProductDescription';
import { formatAttributeValue, buildSpecificationItems } from '../../../utils/attributeFormatters';

const mockDetailProduct = {
  id: 'test-dev-1',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  cpu: 'Quad-core 1.3 GHz Cortex-A53',
  ram: '2 GB RAM',
  os: 'Android 6.0 (Marshmallow)',
  displayResolution: '720 x 1280 pixels',
  battery: 'Non-removable Li-Ion 3780 mAh battery',
  primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: '2 MP',
  dimentions: '191.7 x 101 x 9.3 mm',
  weight: '260',
};

describe('ProductDescription component', () => {
  it('renders Brand, Model, and formatted Price correctly', () => {
    render(<ProductDescription product={mockDetailProduct} />);

    expect(screen.getByText('Acer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByText('170 €')).toBeInTheDocument();
  });

  it('renders all required technical specification labels and values', () => {
    render(<ProductDescription product={mockDetailProduct} />);

    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Quad-core 1.3 GHz Cortex-A53')).toBeInTheDocument();

    expect(screen.getByText('RAM')).toBeInTheDocument();
    expect(screen.getByText('2 GB RAM')).toBeInTheDocument();

    expect(screen.getByText('Operating System')).toBeInTheDocument();
    expect(screen.getByText('Android 6.0 (Marshmallow)')).toBeInTheDocument();

    expect(screen.getByText('Screen resolution')).toBeInTheDocument();
    expect(screen.getByText('720 x 1280 pixels')).toBeInTheDocument();

    expect(screen.getByText('Battery')).toBeInTheDocument();
    expect(screen.getByText('Non-removable Li-Ion 3780 mAh battery')).toBeInTheDocument();

    expect(screen.getByText('Primary Camera')).toBeInTheDocument();
    expect(screen.getByText('13 MP, autofocus')).toBeInTheDocument();

    expect(screen.getByText('Secondary Camera')).toBeInTheDocument();
    expect(screen.getByText('2 MP')).toBeInTheDocument();

    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('191.7 x 101 x 9.3 mm')).toBeInTheDocument();

    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('260 g')).toBeInTheDocument();
  });

  it('renders fallback dash (-) for null or missing attributes', () => {
    const incompleteProduct = {
      id: 'incomplete-dev',
      brand: 'BrandX',
      model: 'ModelY',
      price: null,
      cpu: null,
      ram: undefined,
      os: '',
      displayResolution: null,
      battery: null,
      primaryCamera: [],
      secondaryCmera: null,
      dimentions: null,
      weight: null,
    };

    render(<ProductDescription product={incompleteProduct} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBe(9);
  });

  it('returns null when product is null or undefined', () => {
    const { container } = render(<ProductDescription product={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('attributeFormatters utilities', () => {
  it('formatAttributeValue handles null, undefined, empty, and arrays', () => {
    expect(formatAttributeValue(null)).toBe('-');
    expect(formatAttributeValue(undefined)).toBe('-');
    expect(formatAttributeValue('')).toBe('-');
    expect(formatAttributeValue([])).toBe('-');
    expect(formatAttributeValue(['12 MP', 'wide'])).toBe('12 MP, wide');
    expect(formatAttributeValue('128 GB')).toBe('128 GB');
  });

  it('buildSpecificationItems extracts correctly and maps API typos', () => {
    const items = buildSpecificationItems({
      dimentions: '100x50mm',
      secondaryCmera: '5 MP',
    });

    const dim = items.find((i) => i.key === 'dimensions');
    const cam = items.find((i) => i.key === 'secondaryCamera');

    expect(dim.value).toBe('100x50mm');
    expect(cam.value).toBe('5 MP');
  });
});
