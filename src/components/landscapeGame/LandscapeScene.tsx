import { OrthographicCamera, Sky } from '@react-three/drei';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { LandscapeContent } from './LandscapeContent.tsx';
import { FPSPlayer } from '../common/player/FPSPlayer.tsx';
import React from 'react';

export function LandscapeScene() {
    return <>
        <Sky sunPosition={[100, 20, 100]}/>

        <ambientLight intensity={1}></ambientLight>
        <mesh position={[2, 0, 0]}>
            <sphereGeometry></sphereGeometry>
            <meshStandardMaterial color={'red'}></meshStandardMaterial>
        </mesh>
        <Physics debug={true}>
            <LandscapeContent></LandscapeContent>

            <RigidBody type="fixed"
                       friction={0.5}
                       colliders={false}>
                <mesh receiveShadow position={[10, -5, 10]} rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[1000, 1000]}/>
                    <meshStandardMaterial color="green"/>
                </mesh>
                <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]}/>
            </RigidBody>


            <FPSPlayer></FPSPlayer>
        </Physics>
    </>;
}
