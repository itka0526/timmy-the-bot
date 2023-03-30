import { ThreeRenderer } from "./ThreeRenderer.js";
import "./style.css";

import * as THREE from "three";
import * as CANNON from "cannon-es";

import { Entities } from "./Entities.js";
import { MoveFreely } from "./developer.js";

import CannonDebugger from "cannon-es-debugger";
import Camera from "./Camera.js";

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

const { updateTimmy, timmyT } = await EntitiesInstance.createTimmyTC();

// debugger stuff :D

const cannonDebugRenderer = CannonDebugger(scene, world, { color: "red" });

// renderer stuff...

const { WebGLRenderer } = new ThreeRenderer();

const camera = new Camera({ config: { cyberTruck: true }, renderer: WebGLRenderer });

camera.target = timmyT.position;

WebGLRenderer.domElement;

// const { followCamera } = MoveFreely(camera, domElement);

function tick(currentTime?: number) {
    camera.updatePan();
    camera.updateZoom();
    camera.updatePosition();

    requestAnimationFrame(tick);

    // followCamera();

    updateTimmy();

    world.step(1 / 60);

    // Render Three.js scene
    WebGLRenderer.render(scene, camera.instance);

    // Update Cannon.js debugger
    cannonDebugRenderer.update();
}

tick();
