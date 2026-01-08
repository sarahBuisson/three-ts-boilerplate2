import React, { useMemo } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { extend } from '@react-three/fiber';

export const TriangleGeometry = (props:{baseSize:number,height:number}) => {
    const shape = React.useMemo(() => {
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, props.height); // Top vertex
        triangleShape.lineTo(-props.baseSize/2, 0); // Bottom-left vertex
        triangleShape.lineTo(props.baseSize/2, 0); // Bottom-right vertex
        triangleShape.closePath(); // Close the triangle
        return triangleShape;
    }, []);

    return (

            <extrudeGeometry {...props}
                args={[
                    shape,
                    { depth: 0.1, bevelEnabled: false }, // Extrusion settings
                ]}
            />

    );
};


export const TriangleHollowGeometry = (props:{baseSize:number,height:number, width:number}) => {
    const shape = React.useMemo(() => {
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, props.height); // Top vertex
        triangleShape.lineTo(-props.baseSize/2, 0); // Bottom-left vertex
        triangleShape.lineTo(-props.baseSize/2+props.width, 0); // Bottom-left vertex
        triangleShape.lineTo( props.height-props.width/props.baseSize/(props.width+props.baseSize), 0); // Bottom-left vertex

        triangleShape.lineTo(props.baseSize/2-props.width, 0); // Bottom-right vertex
        triangleShape.lineTo(props.baseSize/2, 0); // Bottom-right vertex
        triangleShape.closePath(); // Close the triangle
        return triangleShape;
    }, []);

    return (

            <extrudeGeometry {...props}
                args={[
                    shape,
                    { depth: 0.1, bevelEnabled: false }, // Extrusion settings
                ]}
            />

    );
};
extend({TriangleGeometry});
