import * as THREE from "three";

export class ThreeRenderer {
    WebGLRenderer: THREE.WebGLRenderer;

    constructor() {
        this.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas") as HTMLCanvasElement });
        this.WebGLRenderer.setSize(window.innerWidth, window.innerHeight);
        this.WebGLRenderer.setClearColor(0x000000, 1);

        this.WebGLRenderer.autoClear = false;

        // Resize event
        document.addEventListener("resize", () => {
            this.WebGLRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}
