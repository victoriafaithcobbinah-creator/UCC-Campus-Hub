   import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // The user's email is available. We will fetch their full profile later.
  const displayName = user?.email?.split('@')[0] || 'Student';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {displayName}! 🎓</h1>
        <button onClick={handleLogout} className="btn-logout">Log Out</button>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📢 Announcements</h3>
          <p>Check the latest updates from the SRC and your department.</p>
        </div>
        
        <div className="dashboard-card">
          <h3>📅 My Timetable</h3>
          <p>View your upcoming lectures and assignment deadlines.</p>
        </div>

        <div className="dashboard-card highlight-card">
          <h3>🌍 Virtual Campus</h3>
          <p>Step into the 3D world, meet your classmates, and explore UCC.</p>
          <Link to="/virtual-campus" className="btn-enter-campus" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            Enter 3D Campus 🌍
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
