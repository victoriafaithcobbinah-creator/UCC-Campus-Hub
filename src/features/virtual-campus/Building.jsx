import { Html } from '@react-three/drei';

function Building({ location }) {
  // Get the real dimensions and colors from our data file
  const profile = location.architecturalProfile || { width: 10, depth: 8, height: 4, wallColor: '#E0E0E0', roofColor: '#718096' };
  const { width, depth, height, wallColor, roofColor } = profile;

  return (
    <group position={[location.coordinates.x, 0, location.coordinates.z]}>
      {/* 1. The Main Walls */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* 2. The Roof (Slightly wider than the walls) */}
      <mesh position={[0, height + 0.2, 0]} castShadow>
        <boxGeometry args={[width + 0.5, 0.4, depth + 0.5]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* 3. Entrance Canopy (A little architectural detail) */}
      <mesh position={[0, 2.5, depth / 2 + 1]} castShadow>
        <boxGeometry args={[width * 0.4, 0.2, 2]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* 4. Floating Label */}
      <Html position={[0, height + 2.5, 0]} center distanceFactor={25}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '13px',
          color: '#1A365D',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #E2E8F0',
          textAlign: 'center'
        }}>
          <div>{location.commonName}</div>
          <div style={{ fontSize: '9px', color: '#718096', fontWeight: 'normal' }}>
            {location.campusArea.includes('Old') ? 'Old Site' : 'New Site'}
          </div>
        </div>
      </Html>
    </group>
  );
}

// This MUST be a named export to match Scene.jsx
export { Building }; 