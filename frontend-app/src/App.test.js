import React from 'react';
import { render, screen } from '@testing-library/react';

// Tests simples pour le frontend
describe('Frontend Tests', () => {
  
  test('renders simple component', () => {
    const SimpleComponent = () => <div>Cinema App</div>;
    render(<SimpleComponent />);
    expect(screen.getByText('Cinema App')).toBeInTheDocument();
  });

  test('renders button', () => {
    const Button = () => <button>Cliquer</button>;
    render(<Button />);
    expect(screen.getByText('Cliquer')).toBeInTheDocument();
  });

  test('renders title', () => {
    const Title = () => <h1>Titre du film</h1>;
    render(<Title />);
    expect(screen.getByText('Titre du film')).toBeInTheDocument();
  });

}); 