import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

function Player() {
  const playerRef = useRef();
  const { camera } = useThree();
  
  // Track keyboard state
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  
  // Camera offset settings
  const cameraOffset = { x: 0, y: 6, z: 12 };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'w') keys.current.w = true;
      if (e.key.toLowerCase() === 'a') keys.current.a = true;
      if (e.key.toLowerCase() === 's') keys.current.s = true;
      if (e.key.toLowerCase() === 'd') keys.current.d = true;
      if (e.key === 'Shift') keys.current.shift = true;
    };
    
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w') keys.current.w = false;
      if (e.key.toLowerCase() === 'a') keys.current.a = false;
      if (e.key.toLowerCase() === 's') keys.current.s = false;
      if (e.key.toLowerCase() === 'd') keys.current.d = false;
      if (e.key === 'Shift') keys.current.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Sprinting logic: 8 speed normally, 15 speed when holding Shift
    const baseSpeed = 8;
    const sprintMultiplier = keys.current.shift ? 1.8 : 1;
    const speed = baseSpeed * sprintMultiplier * delta;
    
    const pos = playerRef.current.position;

    // Movement
    if (keys.current.w) pos.z -= speed;
    if (keys.current.s) pos.z += speed;
    if (keys.current.a) pos.x -= speed;
    if (keys.current.d) pos.x += speed;

    // Smooth Camera Follow (using Linear Interpolation / Lerp)
    // This makes the camera glide behind the player instead of snapping rigidly
    const targetX = pos.x + cameraOffset.x;
    const targetY = pos.y + cameraOffset.y;
    const targetZ = pos.z + cameraOffset.z;

    camera.position.x += (targetX - camera.position.x) * 5 * delta;
    camera.position.y += (targetY - camera.position.y) * 5 * delta;
    camera.position.z += (targetZ - camera.position.z) * 5 * delta;
    
    camera.lookAt(pos);
  });

  return (
    <mesh ref={playerRef} position={[0, 0.5, 0]} castShadow>
      {/* Player Body */}
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#FF5722" /> 
    </mesh>
  );
}

export default Player;