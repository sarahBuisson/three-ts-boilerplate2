import React, { useMemo } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { extend } from '@react-three/fiber';

export const HexagonGeometry = (props: { radius: number }) => {
    const shape = useMemo(() => {
        const hexagonShape = new THREE.Shape();
        const angleStep = (Math.PI * 2) / 6; // 6 sides for the hexagon
        for (let i = 0; i < 6; i++) {
            const x = props.radius * Math.cos(i * angleStep);
            const y = props.radius * Math.sin(i * angleStep);

            if (i === 0) {
                hexagonShape.moveTo(x, y);
            } else {
                hexagonShape.lineTo(x, y);
            }
        }
        hexagonShape.closePath(); // Close the hexagon
        return hexagonShape;
    }, [props.radius]);

    return (

        <extrudeGeometry {...props}
                         args={[
                             shape,
                             {depth: 0.1, bevelEnabled: false}, // Extrusion settings
                         ]}
        />

    );
};
extend({HexagonGeometry});
