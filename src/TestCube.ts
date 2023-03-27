import * as THREE from "three";

export function TestCube() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);

    const rotateRandomly = () => {
        mesh.rotation.x += 0.1;
        mesh.rotation.y += 0.1;
    };

    return { rotateRandomly, cube: mesh };
}
