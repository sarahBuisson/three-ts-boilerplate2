import { useTexture } from "@react-three/drei";
import { HeightfieldCollider, RigidBody } from "@react-three/rapier";
import { PlaneGeometry, Vector3 } from 'three';
import React, { ReactElement, useEffect, useState } from 'react';


export function GroundHeight(props: {
    heightField: number[][],
    position?: Vector3,
    spriteMap?: ((v: Vector3) => ReactElement | string | undefined)[][]
}) {

    const [heightFieldWidth, setHeightFieldWidth] = useState(props.heightField[0].length);
    const [heightFieldHeight, setHeightFieldHeight] = useState(props.heightField.length);
    const [heightFieldGeometry, setHeightFieldGeometry] = useState<PlaneGeometry>(new PlaneGeometry(
        heightFieldWidth,
        heightFieldHeight,
        heightFieldWidth - 1,
        heightFieldHeight - 1
    ));

    useEffect(() => {

        const newHeightFieldGeometry = new PlaneGeometry(
            heightFieldWidth,
            heightFieldHeight,
            heightFieldWidth - 1,
            heightFieldHeight - 1
        );

        props.heightField.flatMap(it => it).forEach((v, index) => {
            newHeightFieldGeometry.attributes.position.array[index * 3 + 2] = v;
        });
        newHeightFieldGeometry.scale(1, -1, 1);
        newHeightFieldGeometry.rotateX(-Math.PI / 2);
        newHeightFieldGeometry.rotateY(-Math.PI / 2);
        newHeightFieldGeometry.translate(heightFieldWidth / 2, 0, heightFieldWidth / 2)
        newHeightFieldGeometry.computeVertexNormals();
        setHeightFieldGeometry(newHeightFieldGeometry);


    })

    const sprites: ReactElement[] = [];
    props.spriteMap?.forEach((row, y) => {
            row.forEach((spriteFunction, x) => {
                if (spriteFunction) {
                    if (typeof spriteFunction === 'function') {
                        const sprite = spriteFunction(new Vector3(y, props.heightField[y][x] + 0.5, x)) as ReactElement | undefined;
                        if (sprite)
                            sprites.push(sprite);

                    }
                } else {
                    if (spriteFunction) {
                        const texture = useTexture(spriteFunction!!);


                        sprites.push(<sprite key={`${x}-${y}`} position={[y, props.heightField[y][x] + 0.5, x]}
                                             scale={[1, 1, 1]}>
                            <spriteMaterial map={texture}/>
                        </sprite>);
                    }
                }

            });

        }
    )
    ;


    return <RigidBody colliders={false} position={props.position}>
        <mesh geometry={heightFieldGeometry} castShadow receiveShadow position={props.position}>
            <meshPhysicalMaterial color="green" side={2}/>
        </mesh>
        <HeightfieldCollider
            position={new Vector3(heightFieldWidth / 2, 0, heightFieldWidth / 2).add(props.position ? props.position : new Vector3())}

            args={[
                heightFieldWidth - 1,
                heightFieldHeight - 1,
                props.heightField.flatMap(it => it),
                {x: heightFieldWidth, y: 1, z: heightFieldHeight}
            ]}
        />
        {sprites}
    </RigidBody>
}
