import React from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader, SVGResult } from "three/examples/jsm/loaders/SVGLoader";
import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three'
import { RigidBody } from '@react-three/rapier';

const fileMap: Map<string, SVGResult> = new Map()

export function FigureSvg(props: { fileUrl: string,  position?: Vector3 }) {


    if (!fileMap.has(props.fileUrl)) {
        fileMap.set(props.fileUrl, useLoader(SVGLoader, props.fileUrl))
    }
    const svgData = fileMap.get(props.fileUrl)!!

    const shapes = svgData.paths.flatMap((path) => path.toShapes(true));

    const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth: 10,
    });
    geometry.center();

    return (
        <mesh geometry={geometry} scale={0.07} position={props.position}>
            <meshPhongMaterial attach="material" color="red"/>
        </mesh>
    );
};
