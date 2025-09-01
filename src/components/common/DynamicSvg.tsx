import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { getBoundingBoxFromSvgPathWithoutGetBBox, mergePathIntoBox } from '../../service/svg';

const DynamicSvg = (props: {
    filePath: string,
    key?: string,
    position?: Vector3,
    scale?: Vector3,
    svgProcess?: (svg: string) => string,
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
                        const svgElement = svgDoc.getElementById(props.showId)?.cloneNode(true);

                        const paths = svgDoc.getElementById(props.showId)!!.querySelectorAll('path');
                        let boundingBoxes: {
                            path: SVGGraphicsElement,
                            rect: DOMRect,
                            groups: SVGGraphicsElement[]
                        }[] = [];

                        paths.forEach((path) => {

                            const bbox = getBoundingBoxFromSvgPathWithoutGetBBox(path)

                            path.id = JSON.stringify(bbox)
                            if (bbox.x == 0 && bbox.y == 0) {
                                console.error("ignore this path")
                                return;
                            }

                            boundingBoxes.push({path, rect: bbox, groups: [path]});
                        });
                        boundingBoxes.pop()// on retire le 1er path



                        const boundBoxe = mergePathIntoBox(boundingBoxes.map(it => it.path))


                        let svgStr = !!svgElement ? new XMLSerializer().serializeToString(svgElement) : "";
                        const rootAttr = svgDoc.rootElement!!.getAttributeNames()


                        let attrStr = rootAttr.filter(it => it != "viewBox").map((attr) => {
                            return attr += "=\"" + svgDoc.rootElement!!.getAttribute(attr)!!.valueOf() + "\" ";
                        }).join(" ")
                        //    svgElement.box
                        attrStr = `  viewBox="${Math.round(boundBoxe.x)} ${Math.round(boundBoxe.y)} ${Math.round(boundBoxe.width)} ${Math.round(boundBoxe.height)}"  ` + attrStr
                        return "<svg " + attrStr + ">" + svgStr + "</svg>";

                    }
                // Convert the SVG content to a Blob
                let blobContent = svgProcess ? svgProcess(svgContent) : svgContent;

                const blob = new Blob([blobContent], {type: "image/svg+xml;charset=utf-8"});
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
