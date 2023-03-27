import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { cannonToThreeQ, cannonToThreeV, threeToCannonQ, threeToCannonV } from "./cannon.js-three.js";

class Entities {
    private sceneInstance: THREE.Scene;
    private worldInstance: CANNON.World;

    private gltfLoader = new GLTFLoader();

    constructor(s: THREE.Scene, w: CANNON.World) {
        this.sceneInstance = s;
        this.worldInstance = w;
    }

    private createGroundT(): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> {
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.FrontSide });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

        groundMesh.receiveShadow = true;
        groundMesh.rotateX(-Math.PI / 2);

        return groundMesh;
    }

    private createGroundC(): CANNON.Body {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 }); // Set mass to 0 to make the body static
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate the plane to face upwards

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
        const OFFSET = new THREE.Vector3(-0.25, -0.4, 0.575);

        const gltf = await this.gltfLoader.loadAsync("/timmy.glb");

        // THREEJS
        const SD = 0.1;

        const mesh = gltf.scene.children[0] as THREE.Mesh;
        const geometry = mesh.geometry as THREE.BufferGeometry;

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
        );
        const body = new CANNON.Body({ mass: 0, shape: shape });
        body.position.y = 3;

        // ADD WHEELS

        this.createWheelsC(body);

        // METHODS OF TIMMY

        const updateTimmy = () => {
            body.position.x += 0.001;
            const correctedPosition = cannonToThreeV(body.position).add(OFFSET);
            const correctedQuaternion = cannonToThreeQ(body.quaternion);

            mesh.position.copy(correctedPosition);
            mesh.quaternion.copy(correctedQuaternion);
        };

        // ADD BOTH
        updateTimmy(); // INITIAL UPDATE

        this.addToTC(mesh, body);

        return { updateTimmy };
    }

    private addToTC(s: THREE.Mesh, w: CANNON.Body) {
        this.sceneInstance.add(s);
        this.worldInstance.addBody(w);
    }

    private createWheelsC(chassisBody: CANNON.Body) {
        // Set collision filters for wheel and chassis bodies
        const wheelGroup = 999; // A unique group number for wheels
        const chassisGroup = 9999; // A unique group number for the chassis

        const wheelMask = chassisGroup; // Wheels can only collide with the chassis
        const chassisMask = wheelGroup; // Chassis can only collide with the wheels

        const wheelShape = new CANNON.Sphere(0.12);

        const wheelBody1 = new CANNON.Body({ mass: 5, position: new CANNON.Vec3(-0.39, -0.185, 0.31) });
        const wheelBody2 = new CANNON.Body({ mass: 5, position: new CANNON.Vec3(-0.39, -0.185, -0.31) });
        const wheelBody3 = new CANNON.Body({ mass: 5, position: new CANNON.Vec3(0.39, -0.185, 0.31) });
        const wheelBody4 = new CANNON.Body({ mass: 5, position: new CANNON.Vec3(0.39, -0.185, -0.31) });

        wheelBody1.collisionFilterGroup = wheelGroup;
        wheelBody1.collisionFilterMask = wheelMask;
        wheelBody2.collisionFilterGroup = wheelGroup;
        wheelBody2.collisionFilterMask = wheelMask;
        wheelBody3.collisionFilterGroup = wheelGroup;
        wheelBody3.collisionFilterMask = wheelMask;
        wheelBody4.collisionFilterGroup = wheelGroup;
        wheelBody4.collisionFilterMask = wheelMask;

        chassisBody.collisionFilterGroup = chassisGroup;
        chassisBody.collisionFilterMask = chassisMask;

        wheelBody1.addShape(wheelShape);
        wheelBody2.addShape(wheelShape);
        wheelBody3.addShape(wheelShape);
        wheelBody4.addShape(wheelShape);

        this.worldInstance.addBody(wheelBody1);
        this.worldInstance.addBody(wheelBody2);
        this.worldInstance.addBody(wheelBody3);
        this.worldInstance.addBody(wheelBody4);

        // Create constraints to connect wheels to car body
        const constraints = [
            new CANNON.PointToPointConstraint(chassisBody, new CANNON.Vec3(-0.39, -0.24, 0.31), wheelBody1, new CANNON.Vec3(0, 0, 0)),
            new CANNON.PointToPointConstraint(chassisBody, new CANNON.Vec3(-0.39, -0.24, -0.31), wheelBody2, new CANNON.Vec3(0, 0, 0)),
            new CANNON.PointToPointConstraint(chassisBody, new CANNON.Vec3(0.39, -0.24, 0.31), wheelBody3, new CANNON.Vec3(0, 0, 0)),
            new CANNON.PointToPointConstraint(chassisBody, new CANNON.Vec3(0.39, -0.24, -0.31), wheelBody4, new CANNON.Vec3(0, 0, 0)),
        ];

        constraints.forEach((constraint) => this.worldInstance.addConstraint(constraint));

        wheelBody1.applyForce(new CANNON.Vec3(0, 1, 0));
    }
}

export { Entities };
