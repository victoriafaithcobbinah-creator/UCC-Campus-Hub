import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// We pass the joystick movement as a prop
function Player({ mobileInput = { x: 0, y: 0 } }) {
  const playerRef = useRef();
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });

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

    const baseSpeed = 8;
    const sprintMultiplier = keys.current.shift ? 1.8 : 1;
    const speed = baseSpeed * sprintMultiplier * delta;
    const pos = playerRef.current.position;

    // 1. Calculate Movement Direction
    let moveX = 0;
    let moveZ = 0;

    // Keyboard input
    if (keys.current.w) moveZ -= 1;
    if (keys.current.s) moveZ += 1;
    if (keys.current.a) moveX -= 1;
    if (keys.current.d) moveX += 1;

    // Mobile Joystick input (overrides keyboard if active)
    if (mobileInput.x !== 0 || mobileInput.y !== 0) {
      moveX = mobileInput.x;
      moveZ = mobileInput.y; 
    }

    // 2. Apply Movement
    if (moveX !== 0 || moveZ !== 0) {
      // Normalize vector so diagonal movement isn't faster
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX = (moveX / length) * speed;
      moveZ = (moveZ / length) * speed;

      pos.x += moveX;
      pos.z += moveZ;
    }

    // 3. Smooth Camera Follow
    const cameraOffset = { x: 0, y: 6, z: 12 };
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
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#FF5722" /> 
    </mesh>
  );
}

export default Player;