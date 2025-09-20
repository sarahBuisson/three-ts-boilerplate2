import { getBoundingBoxFromSvgPathWithoutGetBBox, mergePathIntoBox } from './svg';

export function makeSvgFromElement(svgElement: HTMLElement, svgDoc: Document) {

    const paths = svgElement.querySelectorAll('path');
    let boundingBoxes: {
        path: SVGGraphicsElement,
        rect: DOMRect,
        groups: SVGGraphicsElement[]
    }[] = [];

    Array.from(paths).forEach((path) => {

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



    //    svgElement.box
    const attrStr = `  viewBox="${Math.round(boundBoxe.x)} ${Math.round(boundBoxe.y)} ${Math.round(boundBoxe.width)} ${Math.round(boundBoxe.height)}"  `
    return "<svg " + attrStr + ">" + svgStr + "</svg>";
}
