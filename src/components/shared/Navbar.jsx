import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <GraduationCap size={28} color="#E53E3E" />
          <span className="brand-text">UCC Campus Hub</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className={isActive('/')}>Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <button onClick={handleLogout} className="btn-login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Log In</Link>
              <Link to="/register" className="btn-join">Join Community</Link>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" className={isActive('/')} onClick={() => setIsOpen(false)}>Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setIsOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="btn-login" style={{ textAlign: 'left' }}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login" onClick={() => setIsOpen(false)}>Log In</Link>
              <Link to="/register" className="btn-join" onClick={() => setIsOpen(false)}>Join Community</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;