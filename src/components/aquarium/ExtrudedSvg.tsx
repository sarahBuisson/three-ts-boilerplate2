import { MeshProps, useLoader } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as T from "three";
import { Color, ShapePath } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

type  ExtrudedSvgProps = MeshProps & {
    svgPath: string,
    idInSvg?: string,
    maxWidth?: number,
}
const ExtrudedSvg = (props: ExtrudedSvgProps) => {
    const svgData = useLoader(SVGLoader, props.svgPath + "");
    const shapes =
        useMemo(() => {

            if (props.idInSvg) {

                const group = svgData.paths.filter((path) => path?.userData?.node?.parentNode.id == props.idInSvg);


                if (!group || group.length == 0) {
                    console.warn(`Group with ID "${props.idInSvg}" not found in SVG.`);
                    return [];
                }
                return group.map(it => it.toShapes(true));

            } else {

                return svgData.paths.map((p) => p.toShapes(true));

            }

        }, [svgData, props.idInSvg]);
    const pathMathAverage =
        useMemo(() => {

            return averagePathCompute(svgData.paths);
        }, [svgData, props.idInSvg, shapes]);


    let scale = props.maxWidth ? (1 * props.maxWidth / (pathMathAverage.xMax - pathMathAverage.xMin)) : 1;

    const xDec = (pathMathAverage.xMax - pathMathAverage.xMin) * scale / 4;
    const yDec = (pathMathAverage.yMax - pathMathAverage.yMin) * scale / 4;

    return (
        <>


            <mesh scale={scale} position={[xDec, yDec, 0]} >
                {shapes.map((s, i) => {
                    let math = pathCompute(svgData.paths[i])

                    let depth = Math.abs(pathMathAverage.xMin - Math.abs(math.xMin - pathMathAverage.averageX)) / Math.abs(pathMathAverage.xMin - pathMathAverage.xMax) * 100 + 1;

                    return (
                        <mesh key={i} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <extrudeGeometry
                                args={[
                                    s,
                                    {
                                        depth: depth,
                                        bevelEnabled: true,
                                        bevelSize: depth / 2 + Math.random() * 10,
                                        bevelThickness: depth / 2 + Math.random() * 10,
                                        bevelOffset: -4,
                                        steps: 1,
                                    },
                                ]}
                            />
                            <meshPhongMaterial
                                attach="material"
                                color={svgData.paths[i].color.add(new Color(2,0,0))}
                                side={T.DoubleSide}
                            />
                        </mesh>
                    );
                })})
            </mesh>
        </>
    );
};


type PathMath = {
    yMin: number;
    averageY: number;
    yMax: number;
    averageX: number;
    xMax: number;
    xMin: number
};

function pathCompute(shapeP: ShapePath): PathMath {
    let xMin = shapeP.subPaths[0].currentPoint.x
    let xMax = shapeP.subPaths[0].currentPoint.x
    let yMin = shapeP.subPaths[0].currentPoint.y
    let yMax = shapeP.subPaths[0].currentPoint.x
    let xSum = 0, ySum = 0;
    let length = 0;
    shapeP.subPaths
        .flatMap((subPath) => subPath.getPoints())
        .forEach((vector) => {


            if (vector.x < xMin) {
                xMin = vector.x;
            }
            if (vector.x > xMax) {
                xMax = vector.x;
            }
            if (vector.y < yMin) {
                yMin = vector.y;
            }
            if (vector.y > yMax) {
                yMax = vector.y;
            }
            xSum += vector.x;
            ySum += vector.y;
            length++
        })
    return {xMin, xMax, yMin, yMax, averageX: xSum / length, averageY: ySum / length};
}

function averagePathCompute(shapePs: ShapePath[]): PathMath {

    let av: PathMath = shapePs.map(it => pathCompute(it))
        .reduce((acc, shapeP) => {
            const {xMin, xMax, yMin, yMax, averageX, averageY} = (shapeP);
            acc.xMin = Math.min(acc.xMin, xMin);
            acc.xMax = Math.max(acc.xMax, xMax);
            acc.yMin = Math.min(acc.yMin, yMin);
            acc.yMax = Math.max(acc.yMax, yMax);
            acc.averageX += averageX;
            acc.averageY += averageY;
            return acc;
        });
    av.averageX /= shapePs.length;
    av.averageY /= shapePs.length;
    return av;
}

export default ExtrudedSvg;
