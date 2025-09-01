import { Vector3 } from 'three'
import { Text3D } from '@react-three/drei'

export function PositionPointer(props:{position:Vector3}){


return <>
  <mesh position={props.position}>
    <boxGeometry args={[0.5, 0.5, 0.5]}  />
    <meshStandardMaterial color={'mediumpurple'} />
	<Text3D   font="./fonts/helvetiker_regular.typeface.json">{props.position}
	</Text3D>
  </mesh>

</>}
