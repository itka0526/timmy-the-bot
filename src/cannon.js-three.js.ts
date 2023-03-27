import * as CANNON from "cannon-es";
import * as THREE from "three";

export function cannonToThreeV(cannonVec3: CANNON.Vec3): THREE.Vector3 {
    return new THREE.Vector3(cannonVec3.x, cannonVec3.y, cannonVec3.z);
}

export function threeToCannonV(threeVec3: THREE.Vector3): CANNON.Vec3 {
    return new CANNON.Vec3(threeVec3.x, threeVec3.y, threeVec3.z);
}

export function cannonToThreeQ(cannonQuaternion: CANNON.Quaternion): THREE.Quaternion {
    return new THREE.Quaternion(cannonQuaternion.x, cannonQuaternion.y, cannonQuaternion.z, cannonQuaternion.w);
}

export function threeToCannonQ(threeQuaternion: THREE.Quaternion): CANNON.Quaternion {
    return new CANNON.Quaternion(threeQuaternion.x, threeQuaternion.y, threeQuaternion.z, threeQuaternion.w);
}
