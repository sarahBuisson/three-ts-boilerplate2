
import { DOMParser, XMLSerializer } from 'xmldom-qsa';
import { getBoundingBoxFromGElementWithoutGetBBox, getBoundingBoxFromSvgPathWithoutGetBBox } from '../service/svg/svg';
import { svgPathBbox } from "svg-path-bbox";

export function transformGElementToSvg(gElement: SVGGElement, originalSvg: SVGSVGElement): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString('<svg></svg>', 'application/xml');

// Create the SVG element
    const newSvgElement = xmlDoc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Copier les attributs de l'élément <svg> original
    Array.from(originalSvg.attributes).forEach(attr => {
        newSvgElement.setAttribute(attr.name, attr.value);
    });

    // Ajouter l'élément <g> au nouvel SVG
    newSvgElement.appendChild(gElement.cloneNode(true));
    const box=getBoundingBoxFromGElementWithoutGetBBox(gElement)
    newSvgElement.setAttribute("viewBox", `${box.x-1} ${box.y-1} ${box.width+1} ${box.height+1}`);

    // Sérialiser le nouvel SVG
    return new XMLSerializer().serializeToString(newSvgElement);
}

export function groupIntersectingPaths(paths: SVGPathElement[]): SVGGElement[] {
   const retour:SVGGElement[]=[]
    paths.forEach(path => {
        const newGElement = path.cloneNode(true) as SVGGElement;
        retour.push(newGElement);
        const bbox1 = getBoundingBoxFromSvgPathWithoutGetBBox(path);
        let intersects = false;
if(path.children)
        for (const otherPath of Array.from(path.children)) {
            const bbox2 = getBoundingBoxFromSvgPathWithoutGetBBox(otherPath as SVGPathElement);
            if (
                bbox1.x < bbox2.x + bbox2.width &&
                bbox1.x + bbox1.width > bbox2.x &&
                bbox1.y < bbox2.y + bbox2.height &&
                bbox1.y + bbox1.height > bbox2.y
            ) {
                intersects = true;
                break;
            }
        }

        if (intersects) {
            newGElement.appendChild(path.cloneNode(true));
        }
    });

    return retour;
}

export function flattenGElementToPaths(gElement: SVGGElement): SVGPathElement[] {
    const paths: SVGPathElement[] = [];
    const childNodes = Array.from(gElement.querySelectorAll('path, g'));

    childNodes.forEach(node => {
        if (node.tagName === 'path') {
            paths.push(node as SVGPathElement);
        } else if (node.tagName === 'g') {
            const childPaths = flattenGElementToPaths(node as SVGGElement);
            paths.push(...childPaths);
        }
    });

    return paths;
}


function calculatePathBBox(path: SVGPathElement): { x: number; y: number; width: number; height: number } {
    const pathData = path.getAttribute("d");
    if (!pathData) {
        throw new Error("Path element does not have a 'd' attribute.");
    }

    const commands = pathData.match(/[a-df-z][^a-df-z]*/gi); // Split path data into commands
    if (!commands) {
        throw new Error("Invalid path data.");
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let currentX = 0, currentY = 0;

    commands.forEach(command => {
        const type = command[0];
        const values = command.slice(1).trim().split(/[\s,]+/).map(Number);

        switch (type) {
            case "M": // Move to
            case "L": // Line to
                currentX = values[0];
                currentY = values[1];
                break;
            case "H": // Horizontal line to
                currentX = values[0];
                break;
            case "V": // Vertical line to
                currentY = values[0];
                break;
            case "C": // Cubic Bezier curve
                for (let i = 0; i < values.length; i += 6) {
                    currentX = values[i + 4];
                    currentY = values[i + 5];
                }
                break;
                case "c": // Cubic Bezier curve
                for (let i = 0; i < values.length; i += 6) {
                    currentX += values[i + 4];
                    currentY += values[i + 5];
                }
                break;
            case "Z": // Close path
                break;
            case "z": // Close path
                break;
            default:
                console.warn(`Unsupported command: ${type}`);
        }

        // Update bounding box
        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
