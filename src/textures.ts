import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loader = new GLTFLoader();

export let Timmy: GLTF;

loader.load(
    "/timmy.glb",
    (gltf) => {
        // Do something with the loaded model
        Timmy = gltf;
    },
    (progress) => {
        // Progress callback function
    },
    (error) => {
        console.error("Error loading model:", error);
    }
);
