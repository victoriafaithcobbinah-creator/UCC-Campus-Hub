import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '10px', fontWeight: '800' }}>UCC Campus Hub</h1>
      <p style={{ color: '#94A3B8', marginBottom: '40px', fontSize: '16px' }}>Everything you need for campus life.</p>
      
      <Link to="/virtual-campus" style={{ 
        background: '#E53E3E', color: 'white', padding: '16px 32px', borderRadius: '12px', 
        textDecoration: 'none', fontWeight: 'bold', fontSize: '18px', display: 'inline-block', 
        boxShadow: '0 4px 15px rgba(229, 62, 62, 0.4)' 
      }}>
        🎮 Enter Virtual Campus
      </Link>

      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', fontSize: '14px' }}>
        <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
        <Link to="/register" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
      </div>
    </div>
  );
}