import { BufferGeometry, Color, ShaderMaterial } from 'three';
import React, { useMemo } from 'react';
import { extend } from '@react-three/fiber';

// Custom ShaderMaterial
class CustomNormalMaterial extends ShaderMaterial {
    constructor(color1: Color = new Color(0xff0000), color2: Color = new Color(0x00ff00), color3: Color = new Color(0x0000ff)) {
        super({
            uniforms: {
                color1: { value: color1 },
                color2: { value: color2 },
                color3: { value: color3 },
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                varying vec3 vNormal;

                void main() {
                    vec3 normalColor = normalize(vNormal);
                    vec3 blendedColor = mix(color1, color2, abs(normalColor.z));
                    blendedColor = mix(blendedColor, color3, abs(normalColor.y));
                    gl_FragColor = vec4(blendedColor, 1.0);
                }
            `,
        });
    }
}

// Extend the material for React Three Fiber
extend({ CustomNormalMaterial });

// React Component
type CustomNormalMaterialProps = {
    color1?: string;
    color2?: string;
    color3?: string;
    opacity?:number
    geometry: BufferGeometry;
};

export const CustomNormalMaterialMesh: React.FC<CustomNormalMaterialProps> = ({ color1 = '#ff0000', color2 = '#00ff00', color3 = '#0000ff', geometry, opacity=1 }) => {
    const material = useMemo(() => {
        let customNormalMaterial = new CustomNormalMaterial(new Color(color1), new Color(color2), new Color(color3));
        customNormalMaterial.opacity=opacity;
        customNormalMaterial.transparent=opacity<1;
        return customNormalMaterial;
    }, [color1, color2, color3, opacity]);

    return <mesh geometry={geometry} material={material} ></mesh>;
};
