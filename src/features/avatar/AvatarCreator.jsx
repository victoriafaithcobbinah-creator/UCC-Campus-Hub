import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { supabase } from '../../lib/supabase'; 

function BlockyAvatar({ config }) {
  const groupRef = useRef();
  useFrame((state, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.3; });
  const isMale = config.gender === 'male';
  const scale = config.bodyType === 'slim' ? 0.85 : config.bodyType === 'athletic' ? 1.15 : 1;
  const torsoWidth = isMale ? 0.8 : 0.65;
  const legSpacing = isMale ? 0.25 : 0.18;

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={scale}>
      <mesh position={[-legSpacing, 0.4, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color={config.pantsColor} /></mesh>
      <mesh position={[legSpacing, 0.4, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color={config.pantsColor} /></mesh>
      <mesh position={[0, 1.1, 0]}><boxGeometry args={[torsoWidth, 0.9, 0.4]} /><meshStandardMaterial color={config.shirtColor} /></mesh>
      <mesh position={[-(torsoWidth/2 + 0.15), 1.1, 0]}><boxGeometry args={[0.25, 0.8, 0.25]} /><meshStandardMaterial color={config.shirtColor} /></mesh>
      <mesh position={[(torsoWidth/2 + 0.15), 1.1, 0]}><boxGeometry args={[0.25, 0.8, 0.25]} /><meshStandardMaterial color={config.shirtColor} /></mesh>
      <mesh position={[0, 1.8, 0]}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color={config.skinColor} /></mesh>
      <mesh position={[-0.12, 1.85, 0.26]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#111827" /></mesh>
      <mesh position={[0.12, 1.85, 0.26]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#111827" /></mesh>
      <mesh position={[0, 1.7, 0.26]}><boxGeometry args={[0.15, 0.03, 0.02]} /><meshStandardMaterial color="#4B5563" /></mesh>
    </group>
  );
}

export default function AvatarCreator({ userId, initialData, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(initialData?.avatar_config || { gender: 'male', bodyType: 'average', skinColor: '#8B5A2B', shirtColor: '#E53E3E', pantsColor: '#1A202C' });
  const [username, setUsername] = useState(initialData?.username || '');

  const skinTones = ['#FAD6B1', '#D4A373', '#8B5A2B', '#5C3A21', '#3E2723', '#2D1B14'];
  const shirts = ['#E53E3E', '#3B82F6', '#10B981', '#F59E0B', '#1A202C', '#FFFFFF', '#8B5CF6', '#EC4899'];
  const pants = ['#1A202C', '#2D3748', '#4A5568', '#1E3A8A', '#718096'];

  const handleSave = async () => {
    setLoading(true); setError('');
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username must be 3-15 chars, letters/numbers/underscores only.'); setLoading(false); return;
    }

    try {
      // 1. Check uniqueness
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).single();
      if (existing && existing.id !== userId) { setError('Username taken.'); setLoading(false); return; }

      // 2. Save the profile
      const { error: dbError } = await supabase.from('profiles').upsert({
        id: userId,
        username: username.toLowerCase(),
        avatar_config: config,
        has_completed_character: true
      }, { onConflict: 'id' });

      if (dbError) throw dbError;
      
      // 3. Success!
      onComplete(config, username);
    } catch (err) {
      setError(err.message); setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 200, display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
        <h2 style={{ color: 'white', margin: 0 }}>{step === 1 ? 'Appearance' : step === 2 ? 'Clothing' : 'Identity'}</h2>
        {step > 1 && <button onClick={() => setStep(step - 1)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white', padding: '6px 12px', borderRadius: '6px' }}>← Back</button>}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(circle, #1E293B, #020617)' }}>
          <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
            <ambientLight intensity={0.7} /><directionalLight position={[5, 5, 5]} intensity={1} />
            <BlockyAvatar config={config} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>

        <div style={{ width: '350px', background: '#0F172A', padding: '25px', overflowY: 'auto', borderLeft: '1px solid #1E293B' }}>
          {error && <div style={{ background: '#450a0a', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
          
          {step === 1 && (
            <>
              <h3 style={{ color: 'white' }}>Body</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['male', 'female'].map(g => (
                  <button key={g} onClick={() => setConfig({...config, gender: g})} style={{ flex: 1, padding: '10px', background: config.gender === g ? '#3B82F6' : '#1E293B', color: 'white', border: 'none', borderRadius: '8px' }}>{g}</button>
                ))}
              </div>
              <h3 style={{ color: 'white' }}>Skin Tone</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {skinTones.map(c => <button key={c} onClick={() => setConfig({...config, skinColor: c})} style={{ width: '36px', height: '36px', borderRadius: '50%', background: c, border: config.skinColor === c ? '3px solid #3B82F6' : '2px solid #334155' }} />)}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{ color: 'white' }}>Shirt</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {shirts.map(c => <button key={c} onClick={() => setConfig({...config, shirtColor: c})} style={{ width: '32px', height: '32px', borderRadius: '6px', background: c, border: config.shirtColor === c ? '3px solid white' : '2px solid #334155' }} />)}
              </div>
              <h3 style={{ color: 'white' }}>Pants</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {pants.map(c => <button key={c} onClick={() => setConfig({...config, pantsColor: c})} style={{ width: '32px', height: '32px', borderRadius: '6px', background: c, border: config.pantsColor === c ? '3px solid white' : '2px solid #334155' }} />)}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={{ color: 'white' }}>Username</h3>
              <input value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} placeholder="e.g. ViiFaith" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: 'white', marginBottom: '20px', boxSizing: 'border-box' }} />
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} style={{ flex: 1, padding: '12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Next →</button>
            ) : (
              <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                {loading ? 'Saving...' : 'Enter Campus 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}