import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

export interface KeyboardState {
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

    let previousPosition: number[] | undefined | [] = localStorage
        .getItem("last-position")
        ?.split(";")
        .map((v) => Number(v));

    let previousQuaternion: number[] | undefined | [] = localStorage
        .getItem("last-quaternion")
        ?.split(";")
        .map((v) => Number(v));

    if (typeof previousPosition === "object" && previousPosition.length >= 2 && typeof previousPosition[0] === "number")
        camera.position.set(previousPosition[0], previousPosition[1], previousPosition[2]);

    if (typeof previousQuaternion === "object" && previousQuaternion.length >= 3 && typeof previousQuaternion[0] === "number")
        camera.quaternion.set(previousQuaternion[0], previousQuaternion[1], previousQuaternion[2], previousQuaternion[3]);

    const keyboardState = KeyboardListener();

    function followCamera() {
        if (!controls.isLocked) return;

        const { forward, backward, left, right } = keyboardState;

        const SPEED = 0.05;

        const direction = new THREE.Vector3();

        const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));

        const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(camera.rotation);

        camera.position.add(direction);

        localStorage.setItem("last-position", `${camera.position.x};${camera.position.y};${camera.position.z}`);
        localStorage.setItem("last-quaternion", `${camera.quaternion.x};${camera.quaternion.y};${camera.quaternion.z};${camera.quaternion.w}`);
    }

    return { controls, followCamera };
}

declare global {
    interface Window {
        aP: number;
        bP: number;
        cP: number;
        wheelGroundContactMaterial: any;
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
