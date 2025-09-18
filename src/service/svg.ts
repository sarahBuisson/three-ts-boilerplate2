import { DOMParser, XMLSerializer } from 'xmldom-qsa';
export function mergePathIntoBox( groups: SVGGraphicsElement[] ) {
    const compute= groups.reduce((acc, svgElement) => {

        if (svgElement instanceof SVGPathElement) {
            const rect = getBoundingBoxFromSvgPathWithoutGetBBox(svgElement)
            acc.x = Math.min(acc.x, rect.x);
            acc.y = Math.min(acc.y, rect.y);
            acc.width = Math.max(acc.width, rect.x + rect.width - acc.x);
            acc.height = Math.max(acc.height, rect.y + rect.height - acc.y);
        }
        return acc;
    }, {x: Infinity, y: Infinity, width: 0, height: 0});
    return  new DOMRect(compute.x,compute.y, compute.width, compute.height);
}

export function toSplitedSvg(svgString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
       const paths = doc.querySelectorAll('path');
    let boundingBoxes: { path: SVGGraphicsElement, rect: DOMRect, groups: SVGGraphicsElement[] }[] = [];

    paths.forEach((path) => {

        const bbox =getBoundingBoxFromSvgPathWithoutGetBBox(path)

        path.id=JSON.stringify(bbox)
        if(bbox.x==0&& bbox.y==0){
            console.error("ignore this path")
            return;
        }

        boundingBoxes.push({path, rect: bbox, groups: [path]});
    });
    boundingBoxes.pop()// on retire le 1er path



    for(let i=0;i<boundingBoxes.length;i++){
        boundingBoxes.forEach((box1) => {
            boundingBoxes.forEach((box2) => {
                if (box1 != box2) {

                    if (doRectsIntersect(box1.rect, box2.rect)) {

                        box1.groups.push(box2.path)
                        box1.groups.push(...box2.groups)
                        box1.rect= mergePathIntoBox([...box1.groups, ...box2.groups])
                        box2.groups = []
                    }
                }
            });
        });
        boundingBoxes = boundingBoxes.filter((box) => box.groups.length > 0)
    }
    let defs = doc.querySelector('defs');

    if (!defs) {
        defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
        doc.documentElement.appendChild(defs);
    }
    boundingBoxes.forEach((box, index) => {
        const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = "group" + index
        box.groups.forEach((path) => group.appendChild(path.cloneNode(true)));
        defs?.appendChild(group);

        box.groups.forEach((path) => {
            path.parentNode?.removeChild(path);
        });


        const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${group.id}`);
        // Calculate the bounding box that surrounds all paths
        const allBoundingBox = mergePathIntoBox(box.groups);

        // Create and append the rectangle
        const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', allBoundingBox.x.toString());
        rect.setAttribute('y', allBoundingBox.y.toString());
        rect.setAttribute('width', allBoundingBox.width.toString());
        rect.setAttribute('height', allBoundingBox.height.toString());
      //  rect.setAttribute('stroke', RgbColor.createRandomColor().toCssColorHex());
        rect.setAttribute('fill', 'none');
        doc.documentElement.appendChild(rect);
        doc.documentElement.appendChild(use);


    });

    return new XMLSerializer().serializeToString(doc);
}


export function getBoundingBoxesFromSvgPaths(svgString: string): DOMRect[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    const boundingBoxes: DOMRect[] = [];

    paths.forEach((path) => {
        const bbox =getBoundingBoxFromSvgPathWithoutGetBBox(path)
        boundingBoxes.push(bbox);
    });

    return boundingBoxes;
}

export function doRectsIntersect(rect1: DOMRect, rect2: DOMRect): boolean {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

export function groupIntersectingPathToSvg2(paths: SVGPathElement[]) {
    const groups: SVGPathElement[][] = [];

    paths.forEach((path, indexPath) => {
        const bbox = getBoundingBoxFromSvgPathWithoutGetBBox(path)
        let addedToGroup = false;

        for (const group of groups) {
            if (group.some((p) => doRectsIntersect(getBoundingBoxFromSvgPathWithoutGetBBox(p), bbox))) {
                group.push(path);
                addedToGroup = true;
                break;
            }
        }

        if (!addedToGroup) {
            groups.push([path]);
        }
    });

    return groups.map((group) => {
        const svgGroup = new DOMParser().parseFromString("<!DOCTYPE html><svg><g></g></svg>", 'image/svg+xml');
        let g = svgGroup.getElementsByTagName("g")[0];
        group.forEach((path) => g.appendChild(path.cloneNode(true)));
        return g;
    });
}

export function groupIntersectingPathsToSvg(svgString: string): SVGGElement[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'));
    return groupIntersectingPathToSvg2(paths);
}

export function getBoundingBoxFromSvgPathWithoutGetBBox(path:SVGPathElement): DOMRect {

    if (!path) {
        throw new Error('Invalid SVG path string');
    }

    const d = path.getAttribute('d');
    if (!d) {
        throw new Error('Path has no "d" attribute');
    }

    const commands = d.match(/[a-df-z][^a-df-z]*/ig);
    if (!commands) {
        throw new Error('Invalid path data');
    }

    let x = 0, y = 0;
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

    commands.forEach(command => {
        const type = command[0];
        const args = command.slice(1).trim().split(/[\s,]+/).map(Number);

        switch (type) {
            case 'M':
            case 'L':
                x = args[0];
                y = args[1];
                break;
            case 'm':
            case 'l':
                x += args[0];
                y += args[1];
                break;
            case 'H':
                x = args[0];
                break;
            case 'h':
                x += args[0];
                break;
            case 'V':
                y = args[0];
                break;
            case 'v':
                y += args[0];
                break;
            case 'C':
                x = args[4];
                y = args[5];
                break;
            case 'c':
                x += args[4];
                y += args[5];
                break;
            case 'S':
            case 'Q':
                x = args[2];
                y = args[3];
                break;
            case 's':
            case 'q':
                x += args[2];
                y += args[3];
                break;
            case 'T':
                x = args[0];
                y = args[1];
                break;
            case 't':
                x += args[0];
                y += args[1];
                break;
            case 'A':
                x = args[5];
                y = args[6];
                break;
            case 'a':
                x += args[5];
                y += args[6];
                break;
            case 'Z':
            case 'z':
                break;
            default:
                throw new Error(`Unsupported path command: ${type}`);
        }
        if(!isNaN(x)&&!isNaN(y)) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    });

    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
}
export function getBoundingBoxFromGElementWithoutGetBBox(gElement: SVGGElement): DOMRect {

    const paths=gElement.getElementsByTagName("path");
 const boxs=Array.from(paths).map(path=>getBoundingBoxFromSvgPathWithoutGetBBox(path));

 const compute= boxs.reduce((acc, rect) => {
     acc.x = Math.min(acc.x, rect.x);
     acc.y = Math.min(acc.y, rect.y);
     acc.width = Math.max(acc.width, rect.x + rect.width - acc.x);
     acc.height = Math.max(acc.height, rect.y + rect.height - acc.y);
     return acc;
 }, {x: Infinity, y: Infinity, width: 0, height: 0});
 return compute
}

class DOMRect {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get top(): number {
        return this.y;
    }

    get right(): number {
        return this.x + this.width;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    get left(): number {
        return this.x;
    }
}

export { DOMRect };
