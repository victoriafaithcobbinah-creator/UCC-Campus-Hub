import { campusLocations } from '../../data/campusLocations';
import { Building } from './Building'; // Note the curly braces!
import Player from './Player';

export default function Scene({ mobileInput }) {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {/* Buildings */}
      {campusLocations.map((location) => (
        <Building key={location.id} location={location} />
      ))}

      {/* Player */}
      <Player mobileInput={mobileInput} />
    </>
  );
}