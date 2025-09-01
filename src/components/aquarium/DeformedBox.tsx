import React, { useRef } from 'react';
import { BoxGeometry, BufferGeometry, Mesh } from 'three';

export function deform(geometry: BufferGeometry, maxY:number, decalage:number=0): BufferGeometry{
    const position = geometry.attributes.position;

    // Déformez une face spécifique (par exemple, la face supérieure)
    for (let i = 0; i < position.count; i++) {

        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);

        // Appliquez une déformation conditionnelle
        if (y == maxY) { // Face supérieure

            let number = y +(z+decalage)%3-1+x%2;

            position.setXYZ(i, x, number, z); // Exemple de déformation

        }
    }

    // Indique que les positions ont été mises à jour
    position.needsUpdate = true;
    return geometry
}
export function deformWave(geometry: BufferGeometry): BufferGeometry{
    const position = geometry.attributes.position;

    // Déformez une face spécifique (par exemple, la face supérieure)
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);

        // Appliquez une déformation conditionnelle
        //   if (y > 0.5) { // Face supérieure
        position.setY(i, z + Math.sin(x * Math.PI) * 0.2); // Exemple de déformation
        // }
    }

    // Indique que les positions ont été mises à jour
    position.needsUpdate = true;
    return geometry
}

export function DeformedBox() {
    const boxRef = useRef<Mesh>(null);

    React.useEffect(() => {
        if (boxRef.current) {
            const geometry = boxRef.current.geometry as BoxGeometry;
            deform(geometry,2);
        }
    }, []);

    return (
        <mesh ref={boxRef}>
            <boxGeometry args={[4, 4, 4,12,12,12]} />
            <meshStandardMaterial color="lightgreen"  metalness={0.5} />
        </mesh>
    );
}
