import { RigidBody } from '@react-three/rapier';
import { forwardRef } from 'react'
function Plane() {
  return (
      <RigidBody
          colliders="cuboid" // Type of collider shape for the wall (a cuboid in this case)
          lockTranslations // Lock translations to prevent movement during physics simulation
          lockRotations
      >
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, -1, 0]}
      scale={[10, 10, 10]}
      receiveShadow
    >
      <planeGeometry />
      <meshStandardMaterial color='greenyellow' />
    </mesh>
      </RigidBody>
  )
}

export { Plane }
