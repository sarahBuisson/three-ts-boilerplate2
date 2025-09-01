import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import React, { useRef } from 'react'
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { OrbitControls } from '@react-three/drei';
import ExtrudedSvg from './ExtrudedSvg';
import { Physics } from '@react-three/rapier';
import { Aquarium } from './Aquarium';
import MovingObject from './MovingObject';
import DynamicSvg from '../common/DynamicSvg';
import { HDRIEnvironment } from '../common/HdriEnvironment';

const aquariumRadius = 20

function buildFishPath(radius: number, decalage: number = 0) {
    const angleStep = (Math.PI * 2) / 8;
    const points = Array.from({length: 8}, (_, i) => {
        const angle = i * angleStep;
        return new Vector3(
            Math.cos(angle) * radius + (Math.random() - 0.5) * radius/3, // X coordinate
            0,                        // Y coordinate (flat on the XZ plane)
            Math.sin(angle) * radius // Z coordinate
        );
    });

    return shiftListByX(points, decalage);
}

function shiftListByX<T>(list: T[], x: number): T[] {
    if (list.length === 0 || x === 0) return list; // Handle empty list or no shift
    const shift = x % list.length; // Ensure shift is within bounds
    return [...list.slice(-shift), ...list.slice(0, -shift)];
}


export function AquariumScene() {

    const {performance} = useControls('Monitoring', {
        performance: false,
    })

    const {animate} = useControls('Cube', {
        animate: true,
    })

    const cubeRef = useRef<Mesh<BoxGeometry, MeshBasicMaterial>>(null)


    const points1: Vector3[] = buildFishPath(aquariumRadius / 2 - 5, 1);
    const points2: Vector3[] = buildFishPath(aquariumRadius / 2 - 2, 3);
    const points3: Vector3[] = buildFishPath(aquariumRadius / 3 - 1, 5);
    return (
        //camera orbitale <OrbitControls makeDefault />-->
        <>
            <HDRIEnvironment></HDRIEnvironment>
            <OrbitControls makeDefault scale={[aquariumRadius * 20, aquariumRadius * 20, aquariumRadius * 20]}
                           target={[0, aquariumRadius/2, 0]} />

            {performance && <Perf position='top-left'/>}


            <directionalLight
                position={[-2, 2, 3]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[1024 * 2, 1024 * 2]}
            />
            <ambientLight intensity={0.2}/>
            <DynamicSvg filePath={"./assets/rocksNew.svg"}
                        showId={"XMLID_720_"}
                        position={points1[0].add(new Vector3(0, -5, 0))}

           scale={new Vector3(5,5,5)} ></DynamicSvg>
            <DynamicSvg
                scale={new Vector3(5,5,4)}
                filePath={"./assets/rocksNew.svg"}
                        showId={"XMLID_6_"}
                        position={points1[6].add(new Vector3(0, -5, 0))}
            ></DynamicSvg>
            <DynamicSvg filePath={"./assets/rocksNew.svg"}
                        showId={"XMLID_633_"}
                        scale={new Vector3(5,5,5)}
                        position={points1[4].add(new Vector3(0, -5, 0))}
            ></DynamicSvg>


            <Physics>
                <Aquarium radius={aquariumRadius} epaisseur={1} waterLevel={aquariumRadius * 1.65}></Aquarium>
            </Physics>
            {/**/}
            <MovingObject points={points1} speed={0.0061}>
                <ExtrudedSvg svgPath={"assets/fishs2New.svg"} idInSvg={"fish2"} maxWidth={10}  ></ExtrudedSvg>

            </MovingObject>
            <MovingObject points={points2} speed={0.0052}>
                <ExtrudedSvg svgPath={"assets/fishs2New.svg"} idInSvg={"fish1"} maxWidth={10}   scale={new Vector3(1,-1,-1)}></ExtrudedSvg>

            </MovingObject>
            <MovingObject points={points3} speed={0.002}>
                <ExtrudedSvg svgPath={"assets/fishs2New.svg"} idInSvg={"fish3"} maxWidth={10}  ></ExtrudedSvg>

            </MovingObject>


        </>
    )
}
