import { render, screen } from '@testing-library/react';
import FeatureCard from '../FeatureCard';

const MockIcon = () => <span data-testid="card-icon">❤️</span>;

describe('FeatureCard', () => {
  it('renders icon, title, and description', () => {
    render(
      <FeatureCard
        icon={<MockIcon />}
        title="החזרי בריאות"
        description="בדיקה מהירה של זכאות להחזרים רפואיים"
      />
    );

    expect(screen.getByText('החזרי בריאות')).toBeInTheDocument();
    expect(screen.getByText('בדיקה מהירה של זכאות להחזרים רפואיים')).toBeInTheDocument();
    expect(screen.getByTestId('card-icon')).toBeInTheDocument();
  });
});
