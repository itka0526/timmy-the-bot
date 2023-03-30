import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TweenLite } from "gsap";
import { Power1 } from "gsap";

export default class Camera {
    time: any;

    // Set up
    container = new THREE.Object3D();

    target = new THREE.Vector3(0, 0, 0);
    targetEased = new THREE.Vector3(0, 0, 0);
    easing = 0.15;

    renderer: THREE.WebGLRenderer;

    angle: any;
    instance = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 80);
    orbitControls?: OrbitControls;

    pan: any;
    zoom: any;
    config: any;

    constructor(_options: any) {
        // Options
        this.time = _options.time;
        this.renderer = _options.renderer;
        this.config = _options.config;

        this.container.matrixAutoUpdate = false;

        this.setAngle();
        this.setInstance();
        this.setZoom();
        this.setPan();
        this.setOrbitControls();
    }

    setAngle() {
        // Set up
        this.angle = {};

        // Items
        this.angle.items = {
            default: new THREE.Vector3(0, 1, -1.15),
            projects: new THREE.Vector3(0.38, -1.4, 1.63),
        };

        // Value
        this.angle.value = new THREE.Vector3();
        this.angle.value.copy(this.angle.items.default);

        // Set method
        this.angle.set = (_name: any) => {
            const angle = this.angle.items[_name];
            if (typeof angle !== "undefined") {
                TweenLite.to(this.angle.value, 2, { ...angle, ease: Power1.easeInOut });
            }
        };
    }

    setInstance() {
        // Set up
        this.instance.up.set(0, 0, 1);
        this.instance.position.copy(this.angle.value);
        this.instance.lookAt(new THREE.Vector3());
        this.container.add(this.instance);
    }

    updatePosition() {
        if (!this.orbitControls?.enabled) {
            this.targetEased.x += (this.target.x - this.targetEased.x) * this.easing;
            this.targetEased.y += (this.target.y - this.targetEased.y) * this.easing;
            this.targetEased.z += (this.target.z - this.targetEased.z) * this.easing;

            // Apply zoom
            this.instance.position.copy(this.targetEased).add(this.angle.value.clone().normalize().multiplyScalar(this.zoom.distance));

            // Look at target
            this.instance.lookAt(this.targetEased);

            // Apply pan
            this.instance.position.x += this.pan.value.x;
            this.instance.position.y += this.pan.value.y;
        }
    }

    setZoom() {
        // Set up
        this.zoom = {};
        this.zoom.easing = 0.1;
        this.zoom.minDistance = 14;
        this.zoom.amplitude = 15;
        this.zoom.value = this.config.cyberTruck ? 0.3 : 0.5;
        this.zoom.targetValue = this.zoom.value;
        this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value;

        // Listen to mousewheel event
        document.addEventListener(
            "mousewheel",
            (_event: any) => {
                this.zoom.targetValue += _event.deltaY * 0.001;
                this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1);
            },
            { passive: true }
        );

        // Touch
        this.zoom.touch = {};
        this.zoom.touch.startDistance = 0;
        this.zoom.touch.startValue = 0;

        this.renderer.domElement.addEventListener("touchstart", (_event) => {
            if (_event.touches.length === 2) {
                this.zoom.touch.startDistance = Math.hypot(
                    _event.touches[0].clientX - _event.touches[1].clientX,
                    _event.touches[0].clientX - _event.touches[1].clientX
                );
                this.zoom.touch.startValue = this.zoom.targetValue;
            }
        });

        this.renderer.domElement.addEventListener("touchmove", (_event) => {
            if (_event.touches.length === 2) {
                _event.preventDefault();

                const distance = Math.hypot(
                    _event.touches[0].clientX - _event.touches[1].clientX,
                    _event.touches[0].clientX - _event.touches[1].clientX
                );
                const ratio = distance / this.zoom.touch.startDistance;

                this.zoom.targetValue = this.zoom.touch.startValue - (ratio - 1);
                this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1);
            }
        });
    }

    updateZoom() {
        this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing;
        this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value;
    }

    setPan() {
        // Set up
        this.pan = {};
        this.pan.enabled = false;
        this.pan.active = false;
        this.pan.easing = 0.1;
        this.pan.start = {};
        this.pan.start.x = 0;
        this.pan.start.y = 0;
        this.pan.value = {};
        this.pan.value.x = 0;
        this.pan.value.y = 0;
        this.pan.targetValue = {};
        this.pan.targetValue.x = this.pan.value.x;
        this.pan.targetValue.y = this.pan.value.y;
        this.pan.raycaster = new THREE.Raycaster();
        this.pan.mouse = new THREE.Vector2();
        this.pan.needsUpdate = false;
        this.pan.hitMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, visible: false })
        );
        this.container.add(this.pan.hitMesh);

        this.pan.reset = () => {
            this.pan.targetValue.x = 0;
            this.pan.targetValue.y = 0;
        };

        this.pan.enable = () => {
            this.pan.enabled = true;

            // Update cursor
            this.renderer.domElement.classList.add("has-cursor-grab");
        };

        this.pan.disable = () => {
            this.pan.enabled = false;

            // Update cursor
            this.renderer.domElement.classList.remove("has-cursor-grab");
        };

        this.pan.down = (_x: number, _y: number) => {
            if (!this.pan.enabled) {
                return;
            }

            // Update cursor
            this.renderer.domElement.classList.add("has-cursor-grabbing");

            // Activate
            this.pan.active = true;

            // Update mouse position
            this.pan.mouse.x = (_x / window.innerWidth) * 2 - 1;
            this.pan.mouse.y = -(_y / window.innerWidth) * 2 + 1;

            // Get start position
            this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance);

            const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh]);

            if (intersects.length) {
                this.pan.start.x = intersects[0].point.x;
                this.pan.start.y = intersects[0].point.y;
            }
        };

        this.pan.move = (_x: number, _y: number) => {
            if (!this.pan.enabled) {
                return;
            }

            if (!this.pan.active) {
                return;
            }

            this.pan.mouse.x = (_x / window.innerWidth) * 2 - 1;
            this.pan.mouse.y = -(_y / window.innerHeight) * 2 + 1;

            this.pan.needsUpdate = true;
        };

        this.pan.up = () => {
            // Deactivate
            this.pan.active = false;

            // Update cursor
            this.renderer.domElement.classList.remove("has-cursor-grabbing");
        };

        // Mouse
        window.addEventListener("mousedown", (_event) => {
            this.pan.down(_event.clientX, _event.clientY);
        });

        window.addEventListener("mousemove", (_event) => {
            this.pan.move(_event.clientX, _event.clientY);
        });

        window.addEventListener("mouseup", () => {
            this.pan.up();
        });

        // Touch
        this.renderer.domElement.addEventListener("touchstart", (_event) => {
            if (_event.touches.length === 1) {
                this.pan.down(_event.touches[0].clientX, _event.touches[0].clientY);
            }
        });

        this.renderer.domElement.addEventListener("touchmove", (_event) => {
            if (_event.touches.length === 1) {
                this.pan.move(_event.touches[0].clientX, _event.touches[0].clientY);
            }
        });

        this.renderer.domElement.addEventListener("touchend", () => {
            this.pan.up();
        });
    }

    updatePan() {
        // If active
        if (this.pan.active && this.pan.needsUpdate) {
            // Update target value
            this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance);

            const intersects = this.pan.raycaster.intersectObjects([this.pan.hitMesh]);

            if (intersects.length) {
                this.pan.targetValue.x = -(intersects[0].point.x - this.pan.start.x);
                this.pan.targetValue.y = -(intersects[0].point.y - this.pan.start.y);
            }

            // Update needsUpdate
            this.pan.needsUpdate = false;
        }

        // Update value and apply easing
        this.pan.value.x += (this.pan.targetValue.x - this.pan.value.x) * this.pan.easing;
        this.pan.value.y += (this.pan.targetValue.y - this.pan.value.y) * this.pan.easing;
    }

    setOrbitControls() {
        // Set up
        this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement);
        this.orbitControls.enabled = false;
        this.orbitControls.zoomSpeed = 0.5;
    }
}
