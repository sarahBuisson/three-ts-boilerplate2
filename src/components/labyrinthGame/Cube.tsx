import { forwardRef } from 'react'
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { RigidBody } from '@react-three/rapier';

type CubeType = Mesh<BoxGeometry, MeshBasicMaterial>

const Cube = forwardRef<CubeType>((_, ref) => (
    <RigidBody
        colliders="cuboid"
        position={[2,2,0]}
        friction={1}
        restitution={0.5}
    >
  <mesh ref={ref} castShadow>
    <boxGeometry args={[1.5, 1.5, 1.5]} />
    <meshStandardMaterial color={'mediumpurple'} />
  </mesh>
    </RigidBody>
))

export { Cube }
