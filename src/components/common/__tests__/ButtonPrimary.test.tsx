import React from 'react';
import { render, screen } from '@testing-library/react';
import ButtonPrimary from '../ButtonPrimary';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="button-icon" {...props} />
);

describe('ButtonPrimary', () => {
  it('renders provided text', () => {
    render(<ButtonPrimary>לחצו כאן</ButtonPrimary>);
    expect(screen.getByText('לחצו כאן')).toBeInTheDocument();
  });

  it('renders optional icon when provided', () => {
    render(
      <ButtonPrimary icon={MockIcon} iconPosition="left">
        עם אייקון
      </ButtonPrimary>
    );

    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
  });
});
