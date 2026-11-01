import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { campusLocations } from '../../data/campusLocations';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';

// Connect to our Game Server
const socket = io('http://localhost:3001');

// --- CONFIGURATION ---
const TRADITIONAL_HALLS = [
  { id: 'atlantic', name: 'Atlantic Hall', coords: { x: -40, z: 30 } },
  { id: 'adehye', name: 'Adehye Hall', coords: { x: -25, z: 15 } },
  { id: 'oguaa', name: 'Oguaa Hall', coords: { x: -25, z: -15 } }
];

const generateRoom = () => {
  const block = String.fromCharCode(65 + Math.floor(Math.random() * 4));
  const floor = Math.floor(Math.random() * 3) + 1;
  const room = Math.floor(Math.random() * 40) + 10;
  return `Block ${block}, Floor ${floor}, Room ${room}`;
};

const MOCK_ROOMMATES = [
  { name: 'Kwame A.', status: 'online', avatar: '🧑🏾‍🎓' },
  { name: 'Esi M.', status: 'offline', avatar: '🏾‍🎓' },
  { name: 'Yaw K.', status: 'online', avatar: '👨🏾‍💻' }
];

// --- UCC APPS ---
const UCC_APPS = [
  { id: 'jobs', icon: '💼', name: 'Jobs', color: '#3B82F6', badge: 'NEW' },
  { id: 'messages', icon: '', name: 'Messages', color: '#60A5FA', badge: '3' },
  { id: 'games', icon: '🎮', name: 'Games', color: '#8B5CF6' },
  { id: 'spaces', icon: '🏠', name: 'My Room', color: '#14B8A6' },
  { id: 'bank', icon: '', name: 'Susu', color: '#6366F1' },
  { id: 'shop', icon: '🛍️', name: 'Shop', color: '#EC4899' }
];

const buildingInfo = {
  'sam_jonah_library': {
    title: '📚 Sam Jonah Library',
    desc: 'Study hard or earn some Campus Credits.',
    actions: [
      { label: ' Study Session', cost: 0, energyCost: 15, reward: 'XP +10', stat: 'xp', value: 10 },
      { label: '💼 Work Shift', cost: 0, energyCost: 25, reward: 'Credits +30', stat: 'credits', value: 30 }
    ]
  },
  'src_building': {
    title: ' SRC Canteen & Hub',
    desc: 'Grab food to restore your energy.',
    actions: [
      { label: '🍛 Buy Kenkey & Fish', cost: 50, energyCost: 0, reward: 'Energy +40', stat: 'energy', value: 40 },
      { label: '🥤 Buy Sobolo', cost: 20, energyCost: 0, reward: 'Energy +15', stat: 'energy', value: 15 }
    ]
  },
  'default': {
    title: '🏛️ UCC Building',
    desc: 'Explore the campus.',
    actions: [
      { label: '📍 Look Around', cost: 0, energyCost: 0, reward: 'Explored!', stat: 'none', value: 0 }
    ]
  }
};

// 1. Floating Joystick
function FloatingJoystick({ onMove }) {
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const maxRadius = 40;

  const handleTouchStart = (e) => {
    if (e.target.closest('button, a, [data-ui]')) return;
    e.preventDefault();
    const touch = e.touches[0];
    setBasePos({ x: touch.clientX, y: touch.clientY });
    setStickPos({ x: 0, y: 0 });
    setActive(true);
    updateStick(touch.clientX, touch.clientY, touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!active) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateStick(basePos.x, basePos.y, touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setActive(false);
    setStickPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  const updateStick = (bx, by, cx, cy) => {
    let dx = cx - bx;
    let dy = cy - by;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    setStickPos({ x: dx, y: dy });
    onMove({ x: dx / maxRadius, y: dy / maxRadius });
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{ position: 'absolute', inset: 0, zIndex: 10, touchAction: 'none' }}>
      {active && (
        <>
          <div style={{ position: 'absolute', left: basePos.x - 50, top: basePos.y - 50, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)' }} />
          <div style={{ position: 'absolute', left: basePos.x - 25 + stickPos.x, top: basePos.y - 25 + stickPos.y, width: 50, height: 50, borderRadius: '50%', background: 'rgba(229, 62, 62, 0.8)', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }} />
        </>
      )}
    </div>
  );
}

// 2. Remote Player (Other students)
function RemotePlayer({ id, username, position }) {
  const meshRef = useRef();
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += (position.x - meshRef.current.position.x) * 0.1;
      meshRef.current.position.z += (position.z - meshRef.current.position.z) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[position.x, 0, position.z]}>
      <mesh position={[0, 1.1, 0]}><boxGeometry args={[0.7, 0.9, 0.4]} /><meshStandardMaterial color="#3B82F6" /></mesh>
      <mesh position={[0, 1.8, 0]}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="#8B5A2B" /></mesh>
      <mesh position={[-0.2, 0.4, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color="#1A202C" /></mesh>
      <mesh position={[0.2, 0.4, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color="#1A202C" /></mesh>
      <Html position={[0, 2.6, 0]} center distanceFactor={15}>
        <div style={{ background: 'rgba(59, 130, 246, 0.9)', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          {username}
        </div>
      </Html>
    </group>
  );
}

// 3. Local Player (You) - UPDATED TO USE CUSTOM AVATAR COLORS!
function LocalPlayer({ mobileInput, playerRef, username, avatarConfig }) {
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const lastEmitTime = useRef(0);

  // Fallback colors if config isn't loaded yet
  const config = avatarConfig || { shirtColor: '#E53E3E', pantsColor: '#1A202C', skinColor: '#8B5A2B', bodyType: 'average' };
  const bodyScale = config.bodyType === 'slim' ? 0.8 : config.bodyType === 'athletic' ? 1.15 : 1;

  useEffect(() => {
    const down = (e) => { if(keys.current[e.key.toLowerCase()] !== undefined) keys.current[e.key.toLowerCase()] = true; };
    const up = (e) => { if(keys.current[e.key.toLowerCase()] !== undefined) keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const speed = 10 * delta;
    let moveX = 0; let moveZ = 0;
    
    if (keys.current.w) moveZ -= 1;
    if (keys.current.s) moveZ += 1;
    if (keys.current.a) moveX -= 1;
    if (keys.current.d) moveX += 1;
    if (mobileInput && (mobileInput.x !== 0 || mobileInput.y !== 0)) { moveX = mobileInput.x; moveZ = mobileInput.y; }
    
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX = (moveX / length) * speed;
      moveZ = (moveZ / length) * speed;
      playerRef.current.position.x += moveX;
      playerRef.current.position.z += moveZ;

      const now = Date.now();
      if (now - lastEmitTime.current > 100) {
        socket.emit('player-move', { x: playerRef.current.position.x, z: playerRef.current.position.z });
        lastEmitTime.current = now;
      }
    }
    
    state.camera.position.x = playerRef.current.position.x;
    state.camera.position.y = (playerRef.current.position.y * bodyScale) + 30;
    state.camera.position.z = playerRef.current.position.z + 40;
    state.camera.lookAt(playerRef.current.position);
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]} scale={bodyScale}>
      <mesh position={[0, 1.1, 0]}><boxGeometry args={[0.7, 0.9, 0.4]} /><meshStandardMaterial color={config.shirtColor} /></mesh>
      <mesh position={[0, 1.8, 0]}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color={config.skinColor} /></mesh>
      <mesh position={[-0.2, 0.4, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color={config.pantsColor} /></mesh>
      <mesh position={[0.2, 0.4, 0]}><boxGeometry args={[0.3, 0.8, 0.3]} /><meshStandardMaterial color={config.pantsColor} /></mesh>
      <Html position={[0, 2.6, 0]} center distanceFactor={15}>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
          {username} (You)
        </div>
      </Html>
    </group>
  );
}

// 4. Building
function Building({ location }) {
  const profile = location.architecturalProfile || { width: 10, depth: 8, height: 4, wallColor: '#E0E0E0', roofColor: '#718096' };
  const { width, depth, height, wallColor, roofColor } = profile;
  return (
    <group position={[location.coordinates.x, 0, location.coordinates.z]}>
      <mesh position={[0, (height / 2) - 0.5, 0]}><boxGeometry args={[width, height, depth]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[0, height - 0.3, 0]}><boxGeometry args={[width + 0.5, 0.4, depth + 0.5]} /><meshStandardMaterial color={roofColor} /></mesh>
      <Html position={[0, height + 2, 0]} center distanceFactor={40}>
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '11px', color: '#1A365D', pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{location.commonName}</div>
      </Html>
    </group>
  );
}

// 5. Proximity Sensor
function ProximitySensor({ playerRef, locations, onNearby }) {
  useFrame(() => {
    if (!playerRef.current) return;
    const playerPos = playerRef.current.position;
    let closest = null;
    let minDist = 25;
    locations.forEach(loc => {
      const dx = playerPos.x - loc.coordinates.x;
      const dz = playerPos.z - loc.coordinates.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < minDist) closest = loc;
    });
    onNearby(closest);
  });
  return null;
}

// 6. App Screen
function AppScreen({ app, onClose, stats }) {
  if (!app) return null;
  return (
    <div data-ui style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '90%', maxWidth: '380px', height: '80%', maxHeight: '700px', borderRadius: '30px', background: '#0F172A', border: '1px solid #1E293B', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button data-ui onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: app.color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>{app.icon}</div>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{app.name}</span>
          </div>
          <div style={{ width: '30px' }}></div>
        </div>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', color: 'white' }}>
          {app.id === 'jobs' && (
            <div>
              <h3 style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '15px' }}>AVAILABLE CAMPUS JOBS</h3>
              {[{ title: 'Library Assistant', pay: 30, energy: 25, icon: '📚' }, { title: 'Lab Technician', pay: 40, energy: 30, icon: '🔬' }].map((job, idx) => (
                <div key={idx} style={{ background: '#1E293B', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>{job.icon}</div>
                    <div><div style={{ fontWeight: 'bold', fontSize: '14px' }}>{job.title}</div><div style={{ fontSize: '11px', color: '#94A3B8' }}>Costs {job.energy}⚡</div></div>
                  </div>
                  <button data-ui style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Apply • ₵{job.pay}</button>
                </div>
              ))}
            </div>
          )}
          {app.id === 'spaces' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', padding: '20px', borderRadius: '16px', marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>YOUR ROOM</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>Atlantic Hall • Block A, Room 31</div>
              </div>
              <h3 style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '15px' }}>ROOMMATES</h3>
              {MOCK_ROOMMATES.map((roommate, idx) => (
                <div key={idx} style={{ background: '#1E293B', padding: '12px', borderRadius: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '28px' }}>{roommate.avatar}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 'bold', fontSize: '14px' }}>{roommate.name}</div><div style={{ fontSize: '11px', color: roommate.status === 'online' ? '#10B981' : '#94A3B8' }}>{roommate.status === 'online' ? '● Online' : '○ Offline'}</div></div>
                </div>
              ))}
            </div>
          )}
          {app.id === 'bank' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', padding: '25px', borderRadius: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>SUSU BALANCE</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>{stats.campusCredits}</div>
              </div>
            </div>
          )}
          {!['jobs', 'spaces', 'bank'].includes(app.id) && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>{app.icon}</div>
              <h2 style={{ color: 'white', marginBottom: '10px' }}>{app.name}</h2>
              <p style={{ color: '#94A3B8', fontSize: '14px' }}>Coming soon to UCC Campus Hub!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 7. The Phone
function UCCPhone({ isOpen, onClose, stats, currentLocation, onAppOpen }) {
  const [time, setTime] = useState(new Date());
  const [screen, setScreen] = useState('lock');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (isOpen) setScreen('lock'); }, [isOpen]);
  if (!isOpen) return null;

  const locationText = currentLocation ? `${currentLocation.commonName} • ${currentLocation.campusArea.includes('Old') ? 'Old Site' : 'New Site'}` : 'Cape Coast • UCC Campus';

  return (
    <div data-ui style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)' }}>
      <button data-ui onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', zIndex: 110 }}> Close</button>
      <div style={{ width: '90%', maxWidth: '380px', height: '85%', maxHeight: '750px', borderRadius: '40px', background: '#0F172A', border: '6px solid #1E293B', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: '100px', height: '28px', background: '#000', borderRadius: '20px', zIndex: 10 }} />
        <div style={{ padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>4G</span>
            <div style={{ width: '22px', height: '10px', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '2px', position: 'relative', padding: '1px' }}>
              <div style={{ width: `${stats.energy}%`, height: '100%', background: stats.energy > 20 ? '#10B981' : '#EF4444', borderRadius: '1px' }}></div>
            </div>
          </div>
        </div>
        {screen === 'lock' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px 20px 20px', zIndex: 5 }}>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ fontSize: '72px', fontWeight: '200', color: 'white', lineHeight: '1', letterSpacing: '-2px' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginTop: '8px', fontWeight: '500' }}>{time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} • {locationText}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button data-ui style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>☀️ Day mode</button>
            </div>
            <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '20px' }}>🎓</div>
                <div style={{ flex: 1 }}><div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>Welcome to UCC!</div><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>You have ₵{stats.campusCredits} credits</div></div>
                <button data-ui style={{ background: '#E53E3E', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Go →</button>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto' }}>
              <button data-ui onClick={() => setScreen('home')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer' }}>Swipe up to unlock ↑</button>
            </div>
          </div>
        )}
        {screen === 'home' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 15px', zIndex: 5 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>🔍</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Search apps</span>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px 8px', alignContent: 'start', overflowY: 'auto' }}>
              {UCC_APPS.map((app, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <button data-ui onClick={() => onAppOpen(app)} style={{ width: '54px', height: '54px', borderRadius: '14px', background: app.color, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    {app.icon}
                    {app.badge && <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', fontSize: '9px', padding: '2px 5px', borderRadius: '8px', fontWeight: 'bold' }}>{app.badge}</div>}
                  </button>
                  <span style={{ color: 'white', fontSize: '10px', fontWeight: '500', textAlign: 'center' }}>{app.name}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 0 5px', display: 'flex', justifyContent: 'center' }}>
              <div onClick={() => setScreen('lock')} style={{ width: '120px', height: '5px', background: 'rgba(255,255,255,0.3)', borderRadius: '5px', cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 8. Onboarding Modal
function OnboardingModal({ userLevel, onComplete }) {
  const isFresher = userLevel.toString().includes('100');
  const [assignedHall] = useState(TRADITIONAL_HALLS[Math.floor(Math.random() * TRADITIONAL_HALLS.length)]);
  const [assignedRoom] = useState(generateRoom());

  if (isFresher) {
    return (
      <div data-ui style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
          <h2 style={{ color: '#1A365D', margin: '0 0 10px 0', fontSize: '24px' }}>Welcome to UCC!</h2>
          <p style={{ color: '#4A5568', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>You have been affiliated to <strong>{assignedHall.name}</strong>!<br/>You have received <strong>1,000 Campus Credits</strong>.</p>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '15px', borderRadius: '12px', marginBottom: '20px', color: '#166534', fontSize: '13px', fontWeight: 'bold' }}>🏠 YOUR NEW HOME<br/>{assignedHall.name}<br/>{assignedRoom}</div>
          <button data-ui onClick={() => onComplete(assignedHall, assignedRoom)} style={{ width: '100%', background: '#E53E3E', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>GO TO MY HALL ‍♂️</button>
        </div>
      </div>
    );
  }
  return (
    <div data-ui style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎓</div>
        <h2 style={{ color: '#1A365D', margin: '0 0 10px 0', fontSize: '24px' }}>Welcome back to UCC!</h2>
        <p style={{ color: '#4A5568', fontSize: '14px', lineHeight: '1.5', marginBottom: '25px' }}>As a continuing student, it's time to find your place on campus.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button data-ui onClick={() => onComplete(null, null)} style={{ background: '#EDF2F7', color: '#1A365D', border: '1px solid #CBD5E0', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>🏘️ Explore Hostels</button>
          <button data-ui onClick={() => onComplete(null, null)} style={{ background: '#1A365D', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>🚶‍️ Explore Campus</button>
        </div>
      </div>
    </div>
  );
}

// 9. Main Page
export default function VirtualCampus() {
  const { user } = useAuth();
  const [mobileInput, setMobileInput] = useState({ x: 0, y: 0 });
  const [nearbyBuilding, setNearbyBuilding] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [teleportTarget, setTeleportTarget] = useState(null);
  const [myHall, setMyHall] = useState(null);
  const [remotePlayers, setRemotePlayers] = useState({});
  const playerRef = useRef();

  const rawLevel = user?.user_metadata?.academic_level || '100';
  const isFresher = rawLevel.toString().includes('100');
  const [stats, setStats] = useState({ energy: 100, campusCredits: isFresher ? 1000 : 0, xp: 0 });
  const [toast, setToast] = useState(null);
  const username = user?.user_metadata?.full_name || 'UCC Student';

  const showToast = (message, isError = false) => {
    setToast({ text: message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOnboardingComplete = (hall, room) => {
    if (hall) {
      setMyHall(hall);
      setTeleportTarget(hall.coords);
      showToast(`🏠 Arrived at ${hall.name}!`);
    }
    setShowOnboarding(false);
  };

  const handleAction = (action) => {
    if (stats.campusCredits < action.cost) { showToast("❌ Not enough Credits!", true); return; }
    if (stats.energy < action.energyCost && action.energyCost > 0) { showToast("😴 Too tired!", true); return; }
    setStats(prev => {
      const newStats = { ...prev };
      newStats.campusCredits -= action.cost;
      if (action.stat === 'energy') newStats.energy = Math.min(100, newStats.energy + action.value);
      else if (action.stat === 'credits') newStats.campusCredits += action.value;
      else if (action.stat === 'xp') newStats.xp += action.value;
      return newStats;
    });
    showToast(`✅ ${action.reward}`);
    setActiveModal(null);
  };

  // Multiplayer Logic
  useEffect(() => {
    socket.emit('join-campus', { username, x: 0, z: 0 });

    socket.on('current-players', (players) => {
      const newPlayers = {};
      players.forEach((p) => { newPlayers[p.id] = p; });
      setRemotePlayers(newPlayers);
    });

    socket.on('player-joined', (player) => {
      setRemotePlayers((prev) => ({ ...prev, [player.id]: player }));
    });

    socket.on('player-moved', (data) => {
      setRemotePlayers((prev) => ({
        ...prev,
        [data.id]: { ...prev[data.id], x: data.x, z: data.z }
      }));
    });

    socket.on('player-left', (id) => {
      setRemotePlayers((prev) => {
        const newPlayers = { ...prev };
        delete newPlayers[id];
        return newPlayers;
      });
    });

    return () => { socket.off(); };
  }, []);

  const info = activeModal ? (buildingInfo[activeModal.id] || buildingInfo['default']) : null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', background: '#87CEEB', overflow: 'hidden', touchAction: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
      {showOnboarding && <OnboardingModal userLevel={rawLevel} onComplete={handleOnboardingComplete} />}

      <div data-ui style={{ position: 'absolute', top: 20, right: 20, zIndex: 40, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#FCD34D', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>🪙 {stats.campusCredits}</div>
        <Link to="/dashboard" data-ui style={{ background: 'rgba(0,0,0,0.5)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>✕</Link>
      </div>

      {myHall && (
        <div data-ui style={{ position: 'absolute', top: 70, right: 20, zIndex: 40 }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', color: '#1A365D', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px', border: '1px solid rgba(0,0,0,0.1)' }}>🏠 {myHall.name}</div>
        </div>
      )}

      <div data-ui style={{ position: 'absolute', top: 70, left: 20, zIndex: 40, background: 'rgba(0,0,0,0.7)', color: '#10B981', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)' }}>
        🟢 {Object.keys(remotePlayers).length + 1} Students Online
      </div>

      {toast && (
        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', background: toast.isError ? '#DC2626' : '#1A365D', color: 'white', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 50, textAlign: 'center' }}>{toast.text}</div>
      )}

      <UCCPhone isOpen={isPhoneOpen} onClose={() => setIsPhoneOpen(false)} stats={stats} currentLocation={nearbyBuilding} onAppOpen={setActiveApp} />
      <AppScreen app={activeApp} onClose={() => setActiveApp(null)} stats={stats} />

      <Canvas camera={{ position: [0, 30, 40], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <fog attach="fog" args={['#87CEEB', 50, 350]} />
        <hemisphereLight args={['#ffffff', '#888888', 0.8]} />
        <directionalLight position={[20, 30, 10]} intensity={0.6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[1000, 1000]} /><meshStandardMaterial color="#4CAF50" /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -125]}><planeGeometry args={[12, 300]} /><meshStandardMaterial color="#4A5568" /></mesh>
        {campusLocations.map((loc) => (<Building key={loc.id} location={loc} />))}
        
        {Object.values(remotePlayers).map((player) => (
          <RemotePlayer key={player.id} id={player.id} username={player.username} position={{ x: player.x, z: player.z }} />
        ))}
        
        {/* UPDATED: Passes the avatar config to the player! */}
        <LocalPlayer 
          mobileInput={mobileInput} 
          playerRef={playerRef} 
          username={username} 
          avatarConfig={user?.user_metadata?.avatar_config} 
        />
        <ProximitySensor playerRef={playerRef} locations={campusLocations} onNearby={setNearbyBuilding} />
      </Canvas>

      <FloatingJoystick onMove={setMobileInput} />

      <div data-ui style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '8px', borderRadius: '30px', display: 'flex', gap: '10px', zIndex: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
        <button data-ui onClick={() => setIsPhoneOpen(true)} style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📱 Phone</button>
        <button data-ui style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🗺️ Map</button>
      </div>

      {nearbyBuilding && !activeModal && !showOnboarding && (
        <button data-ui onClick={() => setActiveModal(nearbyBuilding)} style={{ position: 'absolute', bottom: '100px', right: '20px', background: '#E53E3E', color: 'white', border: 'none', padding: '15px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 30 }}>Interact (E)</button>
      )}

      {activeModal && info && !showOnboarding && (
        <div data-ui style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '25px', boxShadow: '0 -5px 20px rgba(0,0,0,0.2)', zIndex: 30, maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#1A365D', fontSize: '20px' }}>{info.title}</h2>
            <button data-ui onClick={() => setActiveModal(null)} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          </div>
          <p style={{ color: '#4A5568', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>{info.desc}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {info.actions.map((action, idx) => (
              <button key={idx} data-ui onClick={() => handleAction(action)} style={{ background: '#EDF2F7', color: '#1A365D', border: '1px solid #CBD5E0', padding: '15px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <span>{action.label}</span>
                <span style={{ fontSize: '12px', color: '#718096' }}>{action.cost > 0 ? `🪙${action.cost}` : ''} {action.energyCost > 0 ? `-${action.energyCost}⚡` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}