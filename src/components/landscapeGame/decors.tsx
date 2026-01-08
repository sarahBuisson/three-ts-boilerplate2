import { TriangleGeometry, TriangleHollowGeometry } from './Triangle.tsx';
import React, { JSX } from 'react';
import { useTexture } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { BillBoardMaterial } from '../common/shaders/billBoardMaterial/billBoard.tsx';
import { FlatMaterial } from '../common/shaders/flatMaterial/flatMaterial.tsx';
import { SuperflatBisMaterial, SuperflatMaterial } from '../common/shaders/superflatMaterial/superflatMaterial.tsx';
import { HexagonGeometry } from './HexagonGeometry.tsx';
import { CylinderCollider } from '@react-three/rapier';
import type { Vector3 } from 'three';

extend({BillBoardMaterial, FlatMaterial, SuperflatMaterial, SuperflatBisMaterial});

export function Mountain(props: { position: [number, number, number], height: number }) {
    const texture = useTexture("./seamless.jpg");
    return <>
        <mesh position={props.position} scale={props.height}>
            <TriangleGeometry baseSize={props.height} height={props.height * 0.7}></TriangleGeometry>
            <superflatMaterial uTexture={texture} fogColor={"white"} ratioX={24} ratioY={4}></superflatMaterial>

        </mesh>
        <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]}>


            <HexagonGeometry radius={1}></HexagonGeometry>
            <superflatBisMaterial uTexture={texture} fogColor={"white"} ratioX={24} ratioY={4}></superflatBisMaterial>

        </mesh>
        <CylinderCollider

            position={props.position}
            friction={0.5}
            restitution={0.5}
            args={[1, 1,]}></CylinderCollider>
    </>
}

export function TreeOld(props: { position: [number, number, number], height: number }) {
    const texture = useTexture("./pine.jpg");
    return <mesh position={props.position} scale={props.height}>


        <TriangleGeometry baseSize={1} height={props.height}></TriangleGeometry>
        <superflatMaterial uTexture={texture} fogColor={"white"} ratioX={24} ratioY={4}></superflatMaterial>

    </mesh>
}

export function Tree(props: { position?: Vector3 | [number, number, number], height: number, numberOfLines?: number }) {
    const texture = useTexture("./greenPlume.png");
    const wtexture = useTexture("./ivoryLeather.jpg");
    const ctexture = useTexture("./copper.jpg");

    const lineSize = 0.05;
    const baseSize = 1;
    let extraTriangles = null
    console.log(props.numberOfLines )
    if (props.numberOfLines === 2) {
        extraTriangles = <>
            <mesh position={props.position} scale={props.height}>
                <TriangleHollowGeometry baseSize={baseSize + lineSize * 2 * 2}
                                  height={props.height / (baseSize / 2 / (baseSize / 2 + lineSize * 2))}></TriangleHollowGeometry>
                <superflatMaterial uTexture={ctexture} fogColor={"white"} ratioX={1} ratioY={1}></superflatMaterial>
            </mesh>
            <mesh position={props.position} scale={props.height}>
                <TriangleHollowGeometry baseSize={baseSize + lineSize * 2}
                                  height={props.height / (baseSize / 2 / (baseSize / 2 + lineSize))}></TriangleHollowGeometry>
                <superflatMaterial uTexture={wtexture} fogColor={"white"} ratioX={1} ratioY={1}></superflatMaterial>
            </mesh>
        </>
    }
    if (props.numberOfLines === 1) {
        extraTriangles = <>
            <mesh position={props.position} scale={props.height}>
                <TriangleHollowGeometry baseSize={baseSize + lineSize * 2}
                                  height={props.height / (baseSize / 2 / (baseSize / 2 + lineSize))}></TriangleHollowGeometry>
                <superflatMaterial uTexture={ctexture} fogColor={"white"} ratioX={1} ratioY={1}></superflatMaterial>
            </mesh>
        </>
    }

    return <group>
        {extraTriangles}
        <mesh position={props.position} scale={props.height}>
            <TriangleGeometry baseSize={1} height={props.height}></TriangleGeometry>
            <superflatMaterial uTexture={texture} fogColor={"white"} ratioX={1} ratioY={1}></superflatMaterial>
        </mesh>
    </group>
}

export function TreeCase(props: { position: Vector3 | [number, number, number], height: number }): JSX.Element {
    const texture = useTexture("./greenPlume.png");
    return <group {...props}>
        <TreeGroup height={props.height} numberOfLines={2}></TreeGroup>
        <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]}>
            <HexagonGeometry radius={1}></HexagonGeometry>
            <superflatBisMaterial uTexture={texture} fogColor={"white"} ratioX={1} ratioY={1}></superflatBisMaterial>

        </mesh>
        <CylinderCollider

            position={props.position}
            friction={0.5}
            restitution={0.5}
            args={[1, 1,]}></CylinderCollider>
    </group>

};


export function TreeGroup(props: { position: [number, number, number], height: number }) {
    const trees=[]
    for(let i=0;i<5;i++){
        trees.push(<Tree height={Math.random()+props.height} numberOfLines={Math.floor(3*Math.random())} position={[Math.random(),Math.random(),Math.random()]}></Tree>)
    }

    const texture = useTexture("./greenPlume.png");
    return <group>
        {trees}
        <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]}>
            <HexagonGeometry radius={1}></HexagonGeometry>
            <superflatBisMaterial uTexture={texture} fogColor={"white"} ratioX={1} ratioY={1}></superflatBisMaterial>

        </mesh>
        <CylinderCollider

            position={props.position}
            friction={0.5}
            restitution={0.5}
            args={[1, 1,]}></CylinderCollider>
    </group>

};

export function Water(props: { position: [number, number, number] }) {
    const texture = useTexture("./aquarelleSmall.jpg");
    return <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]}>
        <HexagonGeometry radius={1}></HexagonGeometry>
        <meshStandardMaterial map={texture} fogColor={"white"}></meshStandardMaterial>
        <superflatBisMaterial uTexture={texture} fogColor={"white"} ratioY={1.5}></superflatBisMaterial>
    </mesh>
}

export function Sand(props: { position: [number, number, number] }) {
    const texture = useTexture("./sand.jpg");
    return <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]}>
        <HexagonGeometry radius={1}></HexagonGeometry>
        <meshStandardMaterial map={texture} fogColor={"white"}></meshStandardMaterial>
        <superflatBisMaterial uTexture={texture} fogColor={"white"} ratioY={1.5}></superflatBisMaterial>
    </mesh>
}

function moveHere(position: [number, number, number]) {
    console.log("moveHere")
}

export function Zone(props: { position: [number, number, number] }) {
    const texture = useTexture("./sand.jpg");
    console.log(props.position)
    return <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]} onClick={moveHere(props.position)}>
        <HexagonGeometry radius={1}></HexagonGeometry>
        <meshStandardMaterial map={texture} fogColor={"white"}></meshStandardMaterial>
    </mesh>
}
