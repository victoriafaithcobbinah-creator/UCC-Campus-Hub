import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';

// A simple blocky isometric room to match the image vibe
function IsometricRoom() {
  return (
    <group position={[0, -1, 0]} rotation={[0.5, 0.5, 0]}>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[10, 10]} /><meshStandardMaterial color="#E2E8F0" /></mesh>
      {/* Walls */}
      <mesh position={[-5, 1.5, 0]}><boxGeometry args={[0.2, 3, 10]} /><meshStandardMaterial color="#CBD5E1" /></mesh>
      <mesh position={[0, 1.5, -5]}><boxGeometry args={[10, 3, 0.2]} /><meshStandardMaterial color="#CBD5E1" /></mesh>
      {/* Bed */}
      <mesh position={[3, 0.3, -3]}><boxGeometry args={[2, 0.6, 3]} /><meshStandardMaterial color="#4C1D95" /></mesh>
      {/* Desk */}
      <mesh position={[-3, 0.4, -3]}><boxGeometry args={[2.5, 0.1, 1.5]} /><meshStandardMaterial color="#92400E" /></mesh>
      <mesh position={[-3.8, 0.2, -3.5]}><boxGeometry args={[0.2, 0.4, 0.2]} /><meshStandardMaterial color="#1E293B" /></mesh>
      <mesh position={[-2.2, 0.2, -3.5]}><boxGeometry args={[0.2, 0.4, 0.2]} /><meshStandardMaterial color="#1E293B" /></mesh>
    </group>
  );
}

export default function WelcomeBack({ user, profile, onContinue }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0F172A', zIndex: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '-apple-system, sans-serif' }}>
      
      {/* 3D Room Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <Canvas camera={{ position: [8, 8, 8], fov: 30 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <IsometricRoom />
        </Canvas>
      </div>

      {/* Foreground Card (Matches Image) */}
      <div style={{ position: 'relative', zIndex: 10, width: '90%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>👑</div>
          <h1 style={{ color: 'white', fontSize: '32px', margin: '0 0 5px 0', fontWeight: '800', letterSpacing: '-1px' }}>UCC Campus Hub</h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Live your campus story.</p>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '24px', padding: '25px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '50%', 
              background: profile?.avatar_config?.shirtColor || '#3B82F6', 
              border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' 
            }}>🏾‍🎓</div>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{profile?.username || 'Student'}</div>
              <div style={{ color: '#94A3B8', fontSize: '12px' }}>{new Date().toLocaleDateString()} • ₵{profile?.campus_credits || 1000}</div>
            </div>
          </div>

          <button 
            onClick={onContinue}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#10B981', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '15px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
          >
            Continue to Campus →
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#64748B' }}>Signed in as <strong style={{ color: '#94A3B8' }}>{user?.email}</strong></span>
            <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 'bold' }}>Log out</Link>
          </div>
        </div>
      </div>
    </div>
  );
}