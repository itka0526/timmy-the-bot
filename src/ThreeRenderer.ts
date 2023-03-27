import * as THREE from "three";

export class ThreeRenderer {
    WebGLRenderer: THREE.WebGLRenderer;

    constructor() {
        this.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas") as HTMLCanvasElement });
        this.WebGLRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}
