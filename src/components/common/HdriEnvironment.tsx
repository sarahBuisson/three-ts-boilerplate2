import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as THREE from "three";

export function HDRIEnvironment() {
    const { scene } = useThree();

    useEffect(() => {
        const loader = new RGBELoader();
        loader.load("./assets/brown_photostudio_01_1k.hdr", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture; // Set as environment map
            scene.background = texture; // Optional: Set as background
        });

        return () => {
            scene.environment = null;
            scene.background = null;
        };
    }, [scene]);

    return null;
}
