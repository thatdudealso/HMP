import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mocking react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

describe('Navbar Component Tests', () => {
  test('renders Navbar with all navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    // Check for brand name or logo
    expect(screen.getByText(/HelpMyPet/i) || screen.getByAltText(/logo/i)).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText(/Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
    expect(screen.getByText(/Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    
    // Check for login button
    expect(screen.getByText(/Login/i) || screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
  
  test('login button is visible and clickable', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const loginButton = screen.getByText(/Login/i) || screen.getByText(/Sign In/i) || screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeEnabled();
  });
}); 