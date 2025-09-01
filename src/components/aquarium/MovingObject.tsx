import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Mesh, Vector3 } from 'three';

export default function MovingObject(props: React.PropsWithChildren<{ points:Vector3[] , speed:number}>) {
    const ref = useRef<Mesh>(null);


// Create the CatmullRomCurve3
    const curve = new CatmullRomCurve3(props.points, true); // `true` makes the curve closed

    let t = 0; // Time variable

    useFrame(() => {
        t += props.speed; // Increment time
        if (t > 1) t = 0; // Loop back to start
        if (t < 0) t = 0; // Loop back to start

        // Get position and tangent at time `t`
        const position = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);

        // Update object position
        ref.current?.position.set(position.x, position.y, position.z);

        // Update object rotation to face the tangent
        ref.current?.lookAt(
            position.x + tangent.x,
            position.y + tangent.y,
            position.z + tangent.z
        );
    });

    return (
        <mesh ref={ref} >
            {props.children}
        </mesh>
    );
}
