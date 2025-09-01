import React, { useRef, useState } from 'react';
import { BoxGeometry, DoubleSide, Material, Matrix4, Mesh, SphereGeometry } from 'three';
import { CSG } from 'three-csg-ts';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { deform } from './DeformedBox';
import { useTexture } from '@react-three/drei';

class AquariumGeometrie {
    constructor(public bocal: BufferGeometry,
                public water: BufferGeometry,
                public sand1: BufferGeometry,
                public sand2: BufferGeometry,
                public sand3: BufferGeometry,
                public subtractedCSG: CSG,
        //        public openingView: Mesh<ConeGeometry, Material | Material[]>,
                public debug?: {
                    surfaceBox?: BufferGeometry,
                    sandBox1?: BufferGeometry,
                    sandBox2?: BufferGeometry,
                    sandBox3?: BufferGeometry,
                    smallinsideSphere?: BufferGeometry
                }) {
    }

}

function generateAquariumGeometrie(props: {
    radius: number;
    epaisseur: number;
    waterLevel?: number;
    material?: Material
}): AquariumGeometrie {

    // Créer la première sphère
    let radius = props.radius;
    let diametre = radius * 2;
    const openingSphere = new Mesh(new SphereGeometry(radius, radius, radius));
  //  const openingView = new Mesh(new SphereGeometry(radius, radius, radius));
    const insideSphere = new Mesh(new SphereGeometry(radius - props.epaisseur, radius, radius));
    const smallinsideSphere = new Mesh(new SphereGeometry(radius - props.epaisseur - 1, radius, radius));

    const surfaceBox = new Mesh(new BoxGeometry(diametre, diametre, diametre, radius, radius));

    const sandBox1 = new Mesh(deform(new BoxGeometry(diametre, diametre, diametre, radius / 2, 3, radius / 2), radius));
    const sandBox2 = new Mesh(deform(new BoxGeometry(diametre, diametre, diametre, radius / 2, 3, radius / 2), radius, 1));
    const sandBox3 = new Mesh(deform(new BoxGeometry(diametre, diametre, diametre, radius / 2, 3, radius / 2), radius, 2));


    //sphere1.position.set(15, -20, 15); // Position de la première sphère
    // sphere1.translateOnAxis(new Vector3(10, 10, 10), 1)
    // Créer la deuxième sphère
    const outsideSphere = new Mesh(new SphereGeometry(radius, radius, radius));
    // sphere2.translateOnAxis(new Vector3(1, 1, 0), 10) // Position de la deuxième sphère
    surfaceBox.applyMatrix4(new Matrix4().makeTranslation(
        0,
        (props.waterLevel || radius),
        0
    ));
    openingSphere.applyMatrix4(new Matrix4().makeTranslation(
        0,
        3 * radius / 2,
        0
    ))/*
    openingView.applyMatrix4(new Matrix4().makeTranslation(
        0,
        radius,
        0
    ))
*/
    sandBox1.applyMatrix4(new Matrix4().makeTranslation(
        0,
        Math.round(5 - radius * 1.5),
        0
    ))
    sandBox2.applyMatrix4(new Matrix4().makeTranslation(
        0,
        Math.round(3 - radius * 1.5),
        0
    ))
    sandBox3.applyMatrix4(new Matrix4().makeTranslation(
        0,
        Math.round(1 - radius * 1.5),
        0
    ))
    // Appliquer la soustraction
    const openingCsg = CSG.fromMesh(openingSphere);
    const outsideCsg = CSG.fromMesh(outsideSphere);
    const insideCsg = CSG.fromMesh(insideSphere);
    const smallinsideCsg = CSG.fromMesh(smallinsideSphere);
   // const openingViewCsg = CSG.fromMesh(openingView);
    const subtractedCSG = outsideCsg.subtract(openingCsg).subtract(insideCsg)
    const sandCsg1 = CSG.fromMesh(smallinsideSphere).intersect(CSG.fromMesh(sandBox1)).subtract(CSG.fromMesh(sandBox3)).subtract(CSG.fromMesh(sandBox2));
    const sandCsg2 = CSG.fromMesh(smallinsideSphere).intersect(CSG.fromMesh(sandBox2)).subtract(CSG.fromMesh(sandBox3));
    const sandCsg3 = CSG.fromMesh(smallinsideSphere).intersect(CSG.fromMesh(sandBox3));

    // Retourner la géométrie résultante
    // return sphere2.geometry//
    let sand1 = sandCsg1.toGeometry(insideSphere.matrix);
    let sand2 = sandCsg2.toGeometry(insideSphere.matrix);
    let sand3 = sandCsg3.toGeometry(insideSphere.matrix);

    let bocal = subtractedCSG.toGeometry(outsideSphere.matrix);

    let water = smallinsideCsg
        .subtract(CSG.fromMesh(surfaceBox))
        .subtract(sandCsg1)
        .subtract(sandCsg2)
        .subtract(sandCsg3)
        .toGeometry(new Matrix4());
    water.applyMatrix4(new Matrix4().makeTranslation(   0,0.1,0));

    return {
        bocal: bocal,
        subtractedCSG: subtractedCSG,
     //   openingView: openingView,
        water: water,

        sand1: sand1,
        sand2: sand2,
        sand3: sand3,
        debug: {
            surfaceBox: surfaceBox.geometry,
            smallinsideSphere: smallinsideSphere.geometry,
            sandBox1: sandBox1.geometry,
            sandBox2: sandBox2.geometry,
            sandBox3: sandBox3.geometry,
        }
    };

}


export function Aquarium(props: { radius: number, epaisseur: number, waterLevel?: number, material?: Material }) {
    const waterTexture=useTexture('./assets/water.jpg')
    const sandTexture=useTexture('./assets/marble.svg')
    const [geometries, setGeometries] = useState<AquariumGeometrie>()
    const [bocal, setBocal] = useState<BufferGeometry>()
    const [cone, setCone] = useState<BufferGeometry>()
    const [intervalOfRefreshUseframe, setintervalOfRefreshUseframe] = useState(0)

    if (geometries == null) {
        let aquariumGeometrie = generateAquariumGeometrie(props);
        setGeometries(aquariumGeometrie)
        setBocal(aquariumGeometrie.bocal)

    }
    const refBocal = useRef<Mesh>()

   /* useFrame(({mouse, viewport}) => {
        const x = (mouse.x * viewport.width) / 2.5
        const y = (mouse.y * viewport.height) / 2.5
        let newCone = geometries?.openingView.geometry;
        newCone?.lookAt(new Vector3(x, -2, y))
        setCone(newCone)

        if(intervalOfRefreshUseframe>15 ) {
            setintervalOfRefreshUseframe(0)
            setBocal(geometries?.subtractedCSG.subtract(CSG.fromGeometry(newCone!!)).toGeometry(new Matrix4()))


        }else{
            setintervalOfRefreshUseframe(intervalOfRefreshUseframe+1)
        }
      //
        //   refBocal.current?.material?.color?.lerp(hovered ? lime : black, 0.05)
    })*/
    return (
        <>
            <mesh geometry={bocal}>
               <meshNormalMaterial side={DoubleSide}/>
                 <meshStandardMaterial color="white" transparent={true}
                                      opacity={0.5}
                                      metalness={0.1}
                                      roughness={0.05} depthWrite={false}

                                      side={DoubleSide}/>

            </mesh>  {  /*
            <CustomNormalMaterialMesh
                opacity={0.15}
                geometry={geometries?.water!!} color1={"lightblue"} color2={"blue"} color3={"aqua"}
            ></CustomNormalMaterialMesh>

*/}
            {<mesh geometry={geometries?.water}>

                <meshStandardMaterial  transparent={true}
                                      map={waterTexture}

                                      opacity={0.4} metalness={0.5} roughness={0.05}
                                      depthWrite={false}
                                      side={DoubleSide}/>


            </mesh>
            }




            <mesh geometry={geometries?.sand1} castShadow receiveShadow>

                <meshPhysicalMaterial color="yellow"
                                      metalness={0.5}
                                      map={sandTexture}
                                      roughness={1}
                                      side={DoubleSide}/>


            </mesh>

            <mesh geometry={geometries?.sand2} castShadow receiveShadow>
                <meshPhysicalMaterial color="white"
                                      metalness={0.5}
                                      map={sandTexture}
                                      roughness={1}
                                      side={DoubleSide}/>


            </mesh>
            <mesh geometry={geometries?.sand3} castShadow receiveShadow>

                <meshPhysicalMaterial color="orange"
                                      metalness={0.5}
                                      roughness={1}
                                      map={sandTexture}
                                      />


            </mesh>
            {/*}
            <ExtrudedSvg svgPath={"assets/fishs2.svg"}></ExtrudedSvg>

            <>
                <mesh geometry={geometries?.debug?.surfaceBox} castShadow receiveShadow
                      position={[props.radius * 3,  (props.waterLevel || props.radius), props.radius * 3]}>

                    <meshPhysicalMaterial color="blue"

                                          side={DoubleSide}/>


                </mesh>
                <mesh geometry={geometries?.debug?.sandBox1} castShadow receiveShadow
                      position={[props.radius * 3, 3 - props.radius *1.5, props.radius * 3]}>
                    <meshPhysicalMaterial color="red"
                                          side={DoubleSide}/>


                </mesh>   <mesh geometry={geometries?.debug?.sandBox2} castShadow receiveShadow
                      position={[props.radius * 3+5, 2- props.radius *1.5, props.radius * 3]}>
                    <meshPhysicalMaterial color="pink"
                                          side={DoubleSide}/>


                </mesh>

            </>*/}


        </>

    );

}
