import fs from "fs-extra";
import { fileURLToPath } from 'url';
import path from "path";
import { DOMParser, XMLSerializer } from 'xmldom-qsa';
import { AssetCollection, AssetData, AssetsDatas, FileData } from './model-asset';
import { buildCustomCollections } from './custom-collection';
import { flattenGElementToPaths, transformGElementToSvg } from './svg-process';
import { groupIntersectingPathToSvg2 } from '../service/svg/svg';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../../assets');
const computedAssetsDir = path.resolve(__dirname, '../../public/assets');
const dataFilePath = path.join(computedAssetsDir, 'data.json');
console.log(assetsDir, computedAssetsDir)

function listRootGElements(svgFilePath: string) {
    // Lire le contenu du fichier SVG
    const svgContent = fs.readFileSync(svgFilePath, 'utf-8');

    // Parser le contenu SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'application/xml');

    // Récupérer l'élément <svg> racine
    const svgElement = doc.getElementsByTagName('svg')[0];
    if (!svgElement) {
        console.error('Aucun élément <svg> trouvé.');
        return [];
    }

    // Lister les éléments <g> à la racine
    const rootGElements = svgElement.getElementsByTagName("g")

    return rootGElements;
}

function dividSvg(filePath: string, destDirectory: string, fileName: string, datas: AssetsDatas) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // Read the SVG content
    const svgContent = fs.readFileSync(filePath, 'utf-8');
    const doc = parser.parseFromString(svgContent, 'application/xml');

    // Récupérer l'élément <svg> racine
    const svgElement = doc.getElementsByTagName('svg')[0];
    if (!svgElement) {
        console.error('Aucun élément <svg> trouvé.');
        return [];
    }

    // Lister les éléments <g> à la racine
    let gElements = Array.from(svgElement.getElementsByTagName("g"))
        .filter(it => it.parentNode?.nodeName == "svg")

    const pathElements = svgElement.getElementsByTagName("path")

    let collectionData = new AssetCollection(filePath)
    let fileData = new FileData(fileName, path.extname(fileName).toLowerCase());
    datas.collections.push(collectionData);
    if (gElements.length == 1) {
        console.log("only one g element, flatten it")
        const paths = flattenGElementToPaths(svgElement)
        const groups = groupIntersectingPathToSvg2(paths)
        groups.forEach((g, i) => {
            const {content: svgContent, box} = transformGElementToSvg(g, svgElement)
            let idAsset = `${fileName}_group${i + 1}`;
            let assetData = new AssetData(idAsset, filePath, `${destDirectory}/${idAsset}.svg`);
            assetData.dimensions = {width: box.width, height: box.height}
            collectionData.assets.push(assetData)

            saveSvgInFile(svgContent, filePath, destDirectory, fileName, idAsset);
        });
    } else if (gElements.length > 1) {
        console.log("many g elements", gElements.length)


        let gObject = gElements.filter(it => it.getAttribute("id") == "OBJECTS");
        if (gObject.length > 0) {
            console.log("<g id=\"OBJECTS\"> found, only process it")
            gElements = Array.from(gObject[0].getElementsByTagName("g")).filter(it => it.getAttribute("id") == "OBJECTS")
            console.log(gElements)
        }

        for (let i = 0; i < Math.min(gElements.length, 20); i++) {
            const gElement = gElements[i];

            if (gElement.getElementsByTagName("g").length > 0) {
                console.log("nested g element" + gElement.getAttribute("id"))
                console.log("id:", gElement.getAttribute("id"))

                const {
                    content: svgIntermediateDoc,
                    box: boxOld
                } = transformGElementToSvg(gElement, svgElement)

                const svg2 = parser.parseFromString(svgIntermediateDoc, 'application/xml');

                const paths = flattenGElementToPaths(svg2.getElementsByTagName("g")[0])

                const xmlDoc = parser.parseFromString('<svg></svg>', 'application/xml');

// Create the SVG element
                const newSvgElement = xmlDoc.createElementNS('http://www.w3.org/2000/svg', 'svg');

                const newGElement = xmlDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
                paths.forEach(p => newGElement.appendChild(p.cloneNode(true)))
                // Save the new SVG to a file
                const {content: svgContent, box} = transformGElementToSvg(gElement, svgElement)
                let idAsset = `${fileName.replace(".svg", "")}_group${i + 1}`;
                let assetData = new AssetData(idAsset, filePath, `${destDirectory}/${idAsset}.svg`);
                assetData.dimensions = {width: box.width, height: box.height}
                collectionData.assets.push(assetData)

                saveSvgInFile(svgContent, filePath, destDirectory, fileName, idAsset);

            } else {
                console.log("simple g element", gElement.getAttribute("id"))
                const xmlDoc = parser.parseFromString('<svg></svg>', 'application/xml');

// Create the SVG element
                const newSvgElement = xmlDoc.createElementNS('http://www.w3.org/2000/svg', 'svg');

                const newGElement = xmlDoc.createElementNS('http://www.w3.org/2000/svg', 'g');


                const paths = gElement.getElementsByTagName("path")// flattenGElementToPaths(gElement)

                Array.from(paths).forEach(p => newGElement.appendChild(p.cloneNode(true)))
                // Save the new SVG to a file
                const {content: svgContent, box} = transformGElementToSvg(gElement, svgElement)
                let idAsset = `${fileName.replace(".svg", "")}_group${i + 1}`;

                let assetData = new AssetData(idAsset, filePath, `${destDirectory}/${idAsset}.svg`);
                assetData.dimensions = {width: box.width, height: box.height}
                collectionData.assets.push(assetData)

                saveSvgInFile(svgContent, filePath, destDirectory, fileName, idAsset);
            }
        }
    } else if (pathElements.length > 0) {
        console.log("no g element, process paths", pathElements.length)
        const groups = groupIntersectingPathToSvg2(Array.from(pathElements))
        groups.forEach((g, i) => {
            const {content: svgContent, box} = transformGElementToSvg(g, svgElement)
            let idAsset = `${fileName.replace(".svg", "")}_group${i + 1}`;
            let assetData = new AssetData(idAsset, filePath, `${destDirectory}/${idAsset}.svg`);
            assetData.dimensions = {width: box.width, height: box.height}
            collectionData.assets.push(assetData)
            saveSvgInFile(svgContent, filePath, destDirectory, fileName, idAsset);
        });
    }


}


async function extractAndProcess(fileRelativePath: string, datas: AssetsDatas) {
    // Exemple d'extraction d'informations (vous pouvez personnaliser cette partie)
    //  const stats = await fs.stat(filePath);
    let filePath = path.join(assetsDir, fileRelativePath);
    const fileName = path.basename(filePath);
    if (fileRelativePath.endsWith(".svg")) {

        const destDirectory = fileRelativePath.replace(".svg", "");
        console.log("svg file :" + fileName)
        if (/s\d*\.svg$/.test(fileName)) {
            console.log("divid svg : " + fileName)

            dividSvg(filePath, destDirectory, fileName, datas);

        } else {
            console.log("copy svg without divid : " + fileName)
        }
    } else {
        console.log("copy file : " + fileName)
    }


    // Copier le fichier dans le répertoire de destination
    await fs.copy(path.join(assetsDir, fileRelativePath), path.join(computedAssetsDir, fileRelativePath));

    // Retourner les informations extraites
    let newVar = new FileData(
        fileName,
        path.extname(fileName).toLowerCase()
    );
    datas.fileDatas.push(newVar)
    return newVar;
}

async function processAssets() {
    try {
        // Créer le répertoire dist/assets s'il n'existe pas
        await fs.ensureDir(computedAssetsDir);

        // Lire les fichiers du répertoire assets
        const files = await fs.readdir(assetsDir, {recursive: true}) as string[];

        const data = [];
        const datas = new AssetsDatas([], []);

        for (const fileRelativePath of files) {
            console.log("Processing file: " + fileRelativePath)
            const filePath = path.join(assetsDir, fileRelativePath);
            const destPath = path.join(computedAssetsDir, fileRelativePath);

            // Vérifier si c'est un fichier
            if ((await fs.stat(filePath)).isFile()) {
                try {
                    const fileData = await extractAndProcess(fileRelativePath, datas);
                    data.push(fileData);
                } catch (e) {
                    console.error(`Error processing file ${fileRelativePath}:`, e);
                }
            }
        }

        buildCustomCollections(datas);// ajoute les collections customisées par les devs

        // Écrire les données extraites dans data.json
        await fs.writeJson(dataFilePath, datas, {spaces: 2});

        console.log('Assets processed successfully!');
    } catch (error) {
        console.error('Error processing assets:', error);
    }
}


function saveSvgInFile(newSvgContent: string, filePath: string, newDirName: string, fileName: string, idAsset: string) {


    if (!fs.existsSync(computedAssetsDir + "/" + newDirName)) {
        fs.mkdirSync(computedAssetsDir + "/" + newDirName, {recursive: true});
    }

    const newFileName = `${idAsset}.svg`;
    const newFilePath = (computedAssetsDir + "\\" + newDirName + "\\" + newFileName);
    fs.writeFileSync(newFilePath, newSvgContent, 'utf-8');
    console.log("createFile : ", newFilePath, computedAssetsDir + newDirName)
    // Add the new file to the collection
    return (new AssetData(idAsset, filePath, newFileName));
}


processAssets();
