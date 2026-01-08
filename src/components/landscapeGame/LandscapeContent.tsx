import { HexagonalTableau, Kase2D } from '../../service/tableau.ts';
import React, { useState } from 'react';
import { extend, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { BillBoardMaterial } from '../common/shaders/billBoardMaterial/billBoard.tsx';
import { FlatMaterial } from '../common/shaders/flatMaterial/flatMaterial.tsx';
import { SuperflatMaterial } from '../common/shaders/superflatMaterial/superflatMaterial.tsx';
import { Mountain, Sand, Tree, TreeCase, Water, Zone } from './decors.tsx';
import { saveImage } from './service.ts';

class KaseLandscape extends Kase2D {
    content?: string;
    scale: number
}

function initTableauAndLab() {
    let kses: KaseLandscape[][] = [];
    for (let i = 0; i < 10; i++) {
        kses[i] = []
        for (let j = 0; j < 10; j++) {
            kses[i][j] = new KaseLandscape(i, j)
            kses[i][j].content = "zone"
            kses[i][j].scale = Math.random() * 3 + 1
        }
    }

    const tableau = new HexagonalTableau(kses)

    for (let i = 0; i < 10; i++) {
        tableau.getKase(i, i)!!.content = "water"
        tableau.getKase(i, 0)!!.content = "mountain"
        tableau.getKase(0, i)!!.content = "tree"
        tableau.getKase(9 - i, i)!!.content = "rock"
    }
    for (let i = 0; i < 10; i++) {

        tableau.randomKase().content = "tree"

        tableau.randomKase().content = "water"

        tableau.randomKase().content = "mountain"
        tableau.randomKase().content = "sand"
    }

    tableau.neighbors(tableau.getKase(5, 5)!!).forEach((kase) => {
        kase.content = "purple"
    })
    return tableau
}

const tab = initTableauAndLab();

const invRec2 = 1 / Math.sqrt(2);
const invRec3 = 1 / Math.sqrt(3);
console.log("invRec2", invRec3)

function getPositionFromKase(kase: Kase2D): [number, number, number] {
    return [kase.x * 1.5, 0, (kase.x * 0.5 + kase.y) / invRec3]
}

extend({BillBoardMaterial, FlatMaterial, SuperflatMaterial})
export const LandscapeContent = () => {
    const {gl, scene, camera} = useThree();
    const [tableau, setTableau] = useState(() => initTableauAndLab());
    let defaultTexture = useTexture("./img.png");
    let mountainTexture = useTexture("./seamless.jpg");
    let pineTexture = useTexture("./pine.jpg");

    let elements = <>{tableau.cases.flat().map((kase, index) => {
        switch (kase.content) {
            case "water":
                return <Water position={getPositionFromKase(kase)}></Water>

            case "sand":
                return <Sand position={getPositionFromKase(kase)}></Sand>

            case "tree":
                return <TreeCase position={getPositionFromKase(kase)} height={kase.scale}></TreeCase>
            case "mountain":
                return <Mountain position={getPositionFromKase(kase)} height={kase.scale}></Mountain>
        }
        return <Zone position={getPositionFromKase(kase)}></Zone>;
    })}</>;
    console.log("land")
    return <>
        <sphere onClick={() => saveImage(gl, scene, camera)}>Save Image</sphere>
        ;

        {elements}

    </>
}
