import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DoubleSide } from "three";

const RotatingCone =  () => {
    const coneRef = useRef<THREE.Mesh>(null);
    const { mouse, viewport } = useThree();

    useFrame(() => {
        if (coneRef.current) {
            // Rotate the cone along its local Z-axis (spinning along its tip)
            coneRef.current.rotation.y -= 0.02;

            // Calculate the pointer position in 3D space
            const x = (mouse.x * viewport.width) / 2;
            const y = (mouse.y * viewport.height) / 2;
            const pointerPosition = new THREE.Vector3(x, 0, y);

            // Make the base of the cone face the pointer
            coneRef.current.lookAt(pointerPosition);
        }
    });

    return (
        <mesh ref={coneRef} position={[1, 0, 0]} rotation={[Math.PI / 2,  -Math.PI / 4, 0]}>
            <mesh ref={coneRef} position={[0, 0, -1]} rotation={[Math.PI / 2,0, 0]}>
                <coneGeometry args={[0.5, 2, 32]} />
                <meshStandardMaterial color="white" transparent={true}

                                      metalness={0.1}
                                      roughness={0.05} depthWrite={false}

                                      side={DoubleSide}/>
            </mesh>
        </mesh>
    );
};

export default RotatingCone;
