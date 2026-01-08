import { useThree } from '@react-three/fiber';
import { Camera, Scene, WebGLRenderer } from 'three';

export const saveImage = ( gl:WebGLRenderer, scene:Scene, camera:Camera ) => {

    // Render the scene to the WebGLRenderer
    gl.render(scene, camera);

    // Convert the canvas content to a blob
    gl.domElement.toBlob((blob) => {
        if (blob) {
            // Create a download link
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            console.log(link)
            link.download = "scene.png";
            link.click();

            // Revoke the object URL to free memory
         //   URL.revokeObjectURL(link.href);
            return  link.href
        }
    }, "image/png");
};
