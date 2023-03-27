import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

interface KeyboardState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
}

export function KeyboardListener() {
    const keyboardState: KeyboardState = {
        forward: false,
        backward: false,
        left: false,
        right: false,
    };

    document.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "KeyW":
                keyboardState.forward = true;
                break;
            case "KeyS":
                keyboardState.backward = true;
                break;
            case "KeyA":
                keyboardState.left = true;
                break;
            case "KeyD":
                keyboardState.right = true;
                break;
        }
    });

    document.addEventListener("keyup", (event) => {
        switch (event.code) {
            case "KeyW":
                keyboardState.forward = false;
                break;
            case "KeyS":
                keyboardState.backward = false;
                break;
            case "KeyA":
                keyboardState.left = false;
                break;
            case "KeyD":
                keyboardState.right = false;
                break;
        }
    });

    return keyboardState;
}

export function MoveFreely(camera: THREE.PerspectiveCamera, domElement?: HTMLElement | undefined) {
    const controls = new PointerLockControls(camera, domElement);

    document.getElementsByClassName("test-button")[0].addEventListener("click", () => {
        controls.lock();
    });

    const keyboardState = KeyboardListener();

    function followCamera() {
        const { forward, backward, left, right } = keyboardState;

        const SPEED = 0.05;

        const direction = new THREE.Vector3();

        const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));

        const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(camera.rotation);

        camera.position.add(direction);
    }

    return { controls, followCamera };
}

declare global {
    interface Window {
        aP: number;
        bP: number;
        cP: number;
    }
}

export function ConfigureConstraintPosition({ a, b, w, d }: { a: CANNON.Body; b: CANNON.Body; w: CANNON.World; d: [number, number, number] }) {
    const constraint = new CANNON.PointToPointConstraint(
        a,
        new CANNON.Vec3(window.aP ?? d[0], window.bP ?? d[1], window.cP ?? d[2]),
        b,
        new CANNON.Vec3(0, 0, 0)
    );
    w.addConstraint(constraint);
}
