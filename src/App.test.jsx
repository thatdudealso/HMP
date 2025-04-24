import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/LandingPage', () => () => <div>Mocked LandingPage</div>);
jest.mock('./components/Footer', () => () => <div>Mocked Footer</div>);

// Mock other components to simplify testing
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>
}));

describe('App Component Tests', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Mocked LandingPage/i)).toBeInTheDocument();
    expect(screen.getByText(/Mocked Footer/i)).toBeInTheDocument();
  });
}); 