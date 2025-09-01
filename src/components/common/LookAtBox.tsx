import { Ref, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Mesh } from 'three'
import { BufferGeometry } from 'three/src/core/BufferGeometry';

export default function LookAtBox({ ...props }) {
    const ref:Ref<Mesh<BufferGeometry>> = useRef<Mesh<BufferGeometry>>(null)
    const black = useMemo(() => new Color('black'), [])
    const lime = useMemo(() => new Color('lime'), [])
    const [hovered, setHovered] = useState(false)

    useFrame(({ mouse, viewport }) => {
        const x = (mouse.x * viewport.width) / 2.5
        const y = (mouse.y * viewport.height) / 2.5
        ref.current?.lookAt(x, y, 1)
       // ref.current?.material?.color?.lerp(hovered ? lime : black, 0.05)
    })

   return (
        <mesh
            {...props}
            ref={ref}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <coneGeometry />
            <meshStandardMaterial color={lime} />

            {props.children}
        </mesh>
    )
}
