import fs from'fs'
import { DOMParser, XMLSerializer } from 'xmldom';

function removeGWithoutAttributes(inputSvgPath, outputSvgPath) {
    // Read the SVG file
    const svgContent = fs.readFileSync(inputSvgPath, 'utf-8');

    // Parse the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'application/xml');

    // Get all <g> elements
    const gElements = doc.getElementsByTagName('g');

    // Iterate through <g> elements in reverse to safely remove them
    for (let i = gElements.length - 1; i >= 0; i--) {
        const g = gElements[i];
        if ((g.hasAttribute("oldid")&& g.attributes.length === 1)||g.attributes.length === 0) {
            const parent = g.parentNode;
            while (g.firstChild) {
                parent.insertBefore(g.firstChild, g);
            }
            g.parentNode.removeChild(g);
        }
    }

    // Serialize the modified SVG back to a string
    const serializer = new XMLSerializer();
    const updatedSvgContent = serializer.serializeToString(doc);

    // Write the updated SVG to the output file
    fs.writeFileSync(outputSvgPath, updatedSvgContent, 'utf-8');
}

// Example usage
removeGWithoutAttributes('algues.svg', 'alguesNew.svg');
