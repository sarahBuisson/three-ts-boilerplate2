import { Vector3 } from 'three';
import React, { Key } from 'react';
import { useTexture } from '@react-three/drei';

export const SpriteCustom = (props: {
    position?: Vector3,
    scale?: Vector3,
    textureName: string,
    key: Key | undefined
}) => {
    const texture = useTexture(props.textureName!!);
    return (

        <sprite key={props.key} position={props.position} scale={props.scale}>
            <spriteMaterial map={texture}/>
        </sprite>
    );
}
