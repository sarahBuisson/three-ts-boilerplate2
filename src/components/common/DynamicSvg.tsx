import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { makeSvgFromElement } from '../../service/svg/MakeSvgFromElement';

function keepOnlyIdInSvg(svgDoc: Document,
    idToKeep: string
) {
    let elementById = svgDoc.getElementById(idToKeep);
    if(elementById) {
        const svgElement = elementById?.cloneNode(true) as HTMLElement;
        return makeSvgFromElement(svgElement, svgDoc);
    }
}

const DynamicSvg = (props: {
    filePath: string,
    key?: string,
    position?: Vector3,
    scale?: Vector3,
    svgProcess?: (svg: string) => string|undefined,
    showId: string
}) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const loadSvgTexture = async () => {
            try {
                // Fetch the SVG file from the assets directory
                const response = await fetch(props.filePath);
                const svgContent = await response.text();
                let svgProcess = props.svgProcess;

                if (props.showId)
                    svgProcess = (svg: string) => {
                        // Modify the SVG content to include an ID attribute
                        const parser = new DOMParser();
                        const svgDoc = parser.parseFromString(svg, "image/svg+xml");
                        return keepOnlyIdInSvg(svgDoc, props.showId);

                    }
                // Convert the SVG content to a Blob
                let blobContent = svgProcess ? svgProcess(svgContent) : svgContent;

                const blob = new Blob([blobContent!!], {type: "image/svg+xml;charset=utf-8"});
                const url = URL.createObjectURL(blob);

                // Load the Blob as a texture
                const loader = new THREE.TextureLoader();
                return await loader.load(url, (loadedTexture) => {
                    setTexture(loadedTexture);
                    //  URL.revokeObjectURL(url); // Clean up the URL
                    return loadedTexture;
                });
            } catch (error) {
                console.error("Error loading SVG texture:", error);
            }
        };

        loadSvgTexture().then(tex => {
            tex ? setTexture(tex) : null
        });
    }, []);
    return (
        <>
            {texture && (
                <sprite key={props.key} position={props.position}
                        scale={props.scale}>
                    <spriteMaterial map={texture}/>
                </sprite>
            )}
        </>
    );
};

export default DynamicSvg;
