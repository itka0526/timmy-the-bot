import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { cannonToThreeQ, cannonToThreeV } from "./cannon.js-three.js";

class Entities {
    private sceneInstance: THREE.Scene;
    private worldInstance: CANNON.World;

    private gltfLoader = new GLTFLoader();

    private groundMaterial?: CANNON.Material;

    constructor(s: THREE.Scene, w: CANNON.World) {
        this.sceneInstance = s;
        this.worldInstance = w;
    }

    private createGroundT(): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.FrontSide });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

        groundMesh.receiveShadow = true;
        groundMesh.rotateX(-Math.PI / 2);

        return groundMesh;
    }

    private createGroundC(): CANNON.Body {
        const groundShape = new CANNON.Plane();
        const groundMaterial = new CANNON.Material("groundMaterial");

        this.groundMaterial = groundMaterial;

        const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

        return groundBody;
    }

    createGroundTC() {
        const s = this.createGroundT(),
            w = this.createGroundC();

        this.addToTC(s, w);

        return { threeJSGround: s, cannonJSGround: w };
    }

    async createTimmyTC() {
        // OFFSET FOR GLTF AND CANNONJS BODY

        const gltf = await this.gltfLoader.loadAsync("/timmy.glb");

        // THREEJS
        const SD = 0.1;

        const mesh = gltf.scene.children[0] as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;

        mesh.geometry.translate(-2.5, -3.6, 5.75);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.scale.set(SD, SD, SD);

        if (!geometry.boundingBox) throw new Error("boundingBox failed");

        // CANNONJS

        const shape = new CANNON.Box(
            new CANNON.Vec3(
                geometry.boundingBox.max.x - geometry.boundingBox.min.x,
                geometry.boundingBox.max.y - geometry.boundingBox.min.y - 1,
                geometry.boundingBox.max.z - geometry.boundingBox.min.z
            )
                .scale(0.5)
                .scale(SD)
                .scale(0.5)
        );

        const body = new CANNON.Body({ mass: 5 });

        body.addShape(shape);

        body.position.y = 3;

        // ADD RIGIDBODY

        const vehicle = this.createRigidVehicle(body);

        // METHODS OF TIMMY

        var maxSteerVal = Math.PI / 6;
        var maxForce = 4.4;

        const moveTimmy = (event: KeyboardEvent) => {
            var up = event.type == "keyup";

            if (!up && event.type !== "keydown") return;

            switch (event.key) {
                case "w": // forward
                    vehicle.setWheelForce(up ? 0 : maxForce, 1);
                    vehicle.setWheelForce(up ? 0 : maxForce, 3);
                    break;

                case "s": // backward
                    vehicle.setWheelForce(up ? 0 : -maxForce, 1);
                    vehicle.setWheelForce(up ? 0 : -maxForce, 3);
                    break;

                case "d": // right
                    vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
                    vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 2);
                    break;

                case "a": // left
                    vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
                    vehicle.setSteeringValue(up ? 0 : maxSteerVal, 2);
                    break;
            }
        };

        document.onkeydown = moveTimmy;
        document.onkeyup = moveTimmy;

        const updateTimmy = () => {
            const correctedPosition = cannonToThreeV(body.position);
            const correctedQuaternion = cannonToThreeQ(body.quaternion);

            mesh.position.copy(correctedPosition);
            mesh.quaternion.copy(correctedQuaternion);
        };

        // ADD BOTH
        updateTimmy(); // INITIAL UPDATE

        this.addToTC(mesh, body);

        return { updateTimmy, timmyT: mesh };
    }

    private addToTC(s: THREE.Mesh, w: CANNON.Body) {
        this.sceneInstance.add(s);
        this.worldInstance.addBody(w);
    }

    private createRigidVehicle(chassisBody: CANNON.Body) {
        this.worldInstance.defaultContactMaterial.friction = 0.2;

        const wheelMaterial = new CANNON.Material("wheelMaterial");

        const wheelGroundContactMaterial = (window.wheelGroundContactMaterial = new CANNON.ContactMaterial(
            wheelMaterial,
            this.groundMaterial as CANNON.Material,
            {
                friction: 0.3,
                restitution: 0,
                contactEquationStiffness: 1000,
            }
        ));

        this.worldInstance.addContactMaterial(wheelGroundContactMaterial);

        // Create the vehicle
        const vehicle = new CANNON.RigidVehicle({
            chassisBody: chassisBody,
        });

        const x = 0.4,
            y = -0.25,
            z = 0.365,
            r = 0.125,
            m = 5.5;

        var wheelShape = new CANNON.Sphere(r);

        var down = new CANNON.Vec3(-1, 0, 0);

        // fr
        var wheelBody = new CANNON.Body({ mass: m, material: wheelMaterial });
        wheelBody.addShape(wheelShape);

        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(-x, y, z),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
        });

        var wheelBody = new CANNON.Body({ mass: m, material: wheelMaterial });
        wheelBody.addShape(wheelShape);

        // br
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(-x, y, -z),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
        });

        // fr
        var wheelBody = new CANNON.Body({ mass: m, material: wheelMaterial });
        wheelBody.addShape(wheelShape);
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(x, y, z),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
        });

        // bl
        var wheelBody = new CANNON.Body({ mass: m, material: wheelMaterial });
        wheelBody.addShape(wheelShape);
        vehicle.addWheel({
            body: wheelBody,
            position: new CANNON.Vec3(x, y, -z),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down,
        });

        // Some damping to not spin wheels too fast
        for (var i = 0; i < vehicle.wheelBodies.length; i++) {
            vehicle.wheelBodies[i].angularDamping = 0.6;
        }

        vehicle.addToWorld(this.worldInstance);

        return vehicle;
    }
}

export { Entities };
