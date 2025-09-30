import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import React, { ReactElement, useEffect, useRef } from 'react'
import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from 'three'
import { Cube } from './Cube'
import { Sphere } from './Sphere'
import { Physics } from "@react-three/rapier";
import { Player } from './Player';
import { useMouseCapture } from './useMouseCapture';
import { useKeyboard } from './useKeyboard';
import { Labyrinth } from '../../service/labGenerator';
import { buildPassingMap, Kase2D, NormalTableau } from '../../service/tableau';
import { GroundHeight } from './GroundHeight';
import { SpriteCustom } from './SpriteCustom';
import { DeformedBox } from '../aquarium/DeformedBox';
import { AssetsDatas, FileData } from '../../build-tools/model-asset';

const assetsDatas = await fetch('./assets/data.json').then(res => res.json() as Promise<AssetsDatas>)


function getInput(keyboard: any, mouse: { x: number, y: number }) {
    let [x, y, z] = [0, 0, 0];
    let running = false
    // Checking keyboard inputs to determine movement direction
    if (keyboard.get("s")) z += 1.0; // Move backward
    if (keyboard.get("z")) z -= 1.0; // Move forward
    if (keyboard.get("d")) x += 1.0; // Move right
    if (keyboard.get("q")) x -= 1.0; // Move left
    if (keyboard.get(" ")) y += 1.0; // Jump

    // Returning an object with the movement and look direction

    return {
        move: [x, y, z],
        look: [mouse.x / window.innerWidth, mouse.y / window.innerHeight], // Mouse look direction
        running: keyboard.get("Shift"), // Boolean to determine if the player is running (Shift key pressed)
    };
}

let kses: Kase2D[][] = [];
for (let i = 0; i < 10; i++) {
    kses[i] = []
    for (let j = 0; j < 10; j++) {
        kses[i][j] = new Kase2D(i, j)
    }
}

let l = new Labyrinth(new NormalTableau(kses));
l.fillLab()

const passingMap = buildPassingMap(l.tableau, 3, 3)

const heightMap: number[][] = passingMap.map(i => i.map(j => j ? 0 : 1));

const obstacleSpriteMap4=["styletrees.svg_group1","styletrees.svg_group2","styletrees.svg_group3","styletrees.svg_group4","styletrees.svg_group5","styletrees.svg_group6","styletrees.svg_group7","styletrees.svg_group8"]
const obstacleSpriteMap=["trees3_group1","trees3_group2","trees3_group3","trees3_group4","trees3_group5","trees3_group6","trees3_group7","trees3_group8"]
const obstacleSpriteMap3=["simpletrees_group1","simpletrees_group2","simpletrees_group3","simpletrees_group4","simpletrees_group5","simpletrees_group6","simpletrees_group7","simpletrees_group8"]
const obstacleSpriteMap2=["trees.svg_group1","trees.svg_group2","trees.svg_group3","trees.svg_group4","trees.svg_group5","trees.svg_group6"]
const obstacleSpriteMapOld = ["algues_group1",
    "algues_group1",
    "algues_group2",
    "algues_group3",
    "algues_group4"   , "algues_group5"  ,  "algues_group6",  "algues_group7",  "algues_group8"
 ]
// @ts-ignore
const stuffMap: ((v: Vector3) => ReactElement | string | undefined)[][] = passingMap
    .map(i => i.map(j => {
        let assetId = obstacleSpriteMap[Math.floor(Math.random() * obstacleSpriteMap.length)];
        const assetData = assetsDatas?.collections.flatMap(it => it.assets)?.find(it => it.id == assetId)!!
       console.log(assetData,assetId)
        let textureName ='./assets/'+(assetData.computedFilePathName||"star.svg")
        return j ? undefined : (position: Vector3) =>
            SpriteCustom({
                    position,
                    textureName: textureName,
                    key: "" + position.x + " " + position.y + " " + position.z,
                    scale: new Vector3(1, assetData?.dimensions ? (assetData?.dimensions?.height / assetData?.dimensions?.width) : 1, 1)
                }
            ) as (ReactElement);
    }));
heightMap[0][0] = 20;

function Scene() {
    const keyboard = useKeyboard(); // Hook to get keyboard input
    const mouse = useMouseCapture(); // Hook to get mouse input

    const {performance} = useControls('Monitoring', {
        performance: false,
    })

    const {animate} = useControls('Cube', {
        animate: true,
    })

    const cubeRef = useRef<Mesh<BoxGeometry, MeshBasicMaterial>>(null)


    useFrame((_, delta) => {
        if (animate) {
            cubeRef.current!.rotation.y += delta / 3
        }
    })


    // let texture = useTexture('/assets/vite.svg');
    let geo = new BufferGeometry()

    let textureStar = new TextureLoader().load("./assets/star.png");
    let sprites = [];

    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
            let sprite = <sprite position={[i * 20 - 10, 10, j * 20 - 10]} key={`${i}-${j}`}>
                <spriteMaterial map={textureStar}/>
            </sprite>;

            sprites.push(sprite);
        }
    }


    return (
        //camera orbitale <OrbitControls makeDefault />-->
        <>
            {performance && <Perf position='top-left'/>}


            <directionalLight
                position={[-2, 2, 3]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[1024 * 2, 1024 * 2]}
            />
            <ambientLight intensity={0.2}/>
            <Physics debug>
                <Cube ref={cubeRef}/>
                <Sphere/>
                <GroundHeight heightField={heightMap}
                              position={new Vector3(0, 0, 0)}
                              spriteMap={stuffMap}></GroundHeight>
                <Player walk={2} jump={5} input={() => getInput(keyboard, mouse)}/>
                {sprites}
                <DeformedBox></DeformedBox>
            </Physics>
        </>
    )
}

export { Scene }
