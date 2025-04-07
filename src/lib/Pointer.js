// import { WebGLRenderer } from "three";
import { uniform } from "three/src/nodes/TSL.js";
import { Plane, Raycaster, Vector2, Vector3 } from "three/webgpu";
// import { uniform, WebGPURenderer } from "three/webgpu";


/**
 * Helper class to handle pointer position and "down" with output exposed in vector3 and uniforms
 */
export class Pointer {

    camera;
    renderer;
    rayCaster = new Raycaster();
    initPlane = new Plane(new Vector3(0, 0, 1));
    iPlane = new Plane(new Vector3(0, 0, 1));
    clientPointer = new Vector2();
    pointer = new Vector2();
    scenePointer = new Vector3();
    pointerDown = false;
    uPointerDown = uniform(0);
    uPointer = uniform(new Vector3());

    constructor(renderer, camera, plane) {

        this.camera = camera;
        this.renderer = renderer;
        this.initPlane = plane;
        this.iPlane = plane.clone();
        renderer.domElement.addEventListener("pointerdown", this.onPointerDown.bind(this));
        renderer.domElement.addEventListener("pointerup", this.onPointerUp.bind(this));
        window.addEventListener("pointermove", this.onPointerMove.bind(this));

    }

    onPointerDown(e) {
        if (e.pointerType !== 'mouse' || e.button === 0) {
            this.pointerDown = true;
            this.uPointerDown.value = 1;
        }
        this.clientPointer.set(e.clientX, e.clientY);
        this.updateScreenPointer(e);
    }
    onPointerUp(e) {
        this.clientPointer.set(e.clientX, e.clientY);
        this.updateScreenPointer(e);
        this.pointerDown = false;
        this.uPointerDown.value = 0;

    }
    onPointerMove(e) {
        this.clientPointer.set(e.clientX, e.clientY);
        this.updateScreenPointer(e);
    }

    updateScreenPointer(e) {
        if (e == null || e == undefined) {
            e = { clientX: this.clientPointer.x, clientY: this.clientPointer.y };
        }
        this.pointer.set(
            (e.clientX / window.innerWidth) * 2 - 1,
            - (e.clientY / window.innerHeight) * 2 + 1
        );
        this.rayCaster.setFromCamera(this.pointer, this.camera);
        this.rayCaster.ray.intersectPlane(this.iPlane, this.scenePointer);
        this.uPointer.value.x = this.scenePointer.x;
        this.uPointer.value.y = this.scenePointer.y;
        this.uPointer.value.z = this.scenePointer.z;
        //console.log( this.scenePointer );
    }

    update(dt, elapsed) {
        this.iPlane.normal.copy(this.initPlane.normal).applyEuler(this.camera.rotation);
        this.updateScreenPointer();
    }
}