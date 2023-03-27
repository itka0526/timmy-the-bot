import { ThreeRenderer } from "./ThreeRenderer.js";
import "./style.css";

import * as THREE from "three";
import * as CANNON from "cannon-es";

import { Entities } from "./Entities.js";
import { TestCube } from "./TestCube.js";
import { MoveFreely } from "./developer.js";

import CannonDebugger from "cannon-es-debugger";

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

camera.position.y = 2;
camera.position.z = 3;

// world instance

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// scene instance
const scene = new THREE.Scene();

// lighting

const ambientLight = new THREE.AmbientLight(0xffffff, 0.55); // color, intensity
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

// do stuff...

const EntitiesInstance = new Entities(scene, world);

EntitiesInstance.createGroundTC();
const { updateTimmy } = await EntitiesInstance.createTimmyTC();

// debugger stuff :D

const cannonDebugRenderer = CannonDebugger(scene, world);

// renderer stuff...

const { WebGLRenderer } = new ThreeRenderer();

const { followCamera } = MoveFreely(camera, document.getElementById("canvas") as HTMLCanvasElement);

function tick(currentTime?: number) {
    requestAnimationFrame(tick);

    followCamera();
    updateTimmy();

    world.step(1 / 60);

    // Render Three.js scene
    WebGLRenderer.render(scene, camera);

    // Update Cannon.js debugger
    cannonDebugRenderer.update();
}

tick();
