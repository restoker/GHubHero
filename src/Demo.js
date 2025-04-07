
import { Clock, PerspectiveCamera, Vector2, Scene, ACESFilmicToneMapping, Box2, MathUtils, PlaneGeometry, Mesh, Vector3, Color, EquirectangularReflectionMapping, BatchedMesh, Object3D, Plane, PostProcessing, Raycaster, FloatType, MeshStandardNodeMaterial, MeshPhysicalNodeMaterial } from "three/webgpu";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import { BlockGeometry } from "./lib/BlockGeometry";
import FastSimplexNoise from "@webvoxel/fast-simplex-noise";
import { Pointer } from "./lib/Pointer";
import { WebGPURenderer } from "three/webgpu";
import { ABlock } from "./lib/ABlock";
import { OrbitControls, UltraHDRLoader } from "three/examples/jsm/Addons.js";
import { ao } from "three/examples/jsm/tsl/display/GTAONode.js";
import { clamp, mrt, output, pass, transformedNormalView, uniform, viewportUV } from "three/src/nodes/TSL.js";
import { dof } from "three/examples/jsm/tsl/display/DepthOfFieldNode.js";
import { fxaa } from "three/examples/jsm/tsl/display/FXAANode.js";

export class Demo {
    static instance;
    static firstRenderDone = false;
    canvas;
    renderer;
    camera = new PerspectiveCamera(20, 1, 0.1, 500);
    controls;
    post;
    scene = new Scene();
    pointerHandler;
    clock = new Clock(false);


    /**
     * Accessor from react to set the theme
     * @param theme "light" or "dark"
     */
    static setTheme(theme) {
        if (this.instance) {
            this.instance.setColorMode(theme);
        }
    }

    constructor(canvas) {

        this.canvas = canvas;

        if (Demo.instance != null) {
            console.warn("Demo instance already exists");
            return null;
        }
        Demo.instance = this;
    }

    // start here
    async init() {
        if (WebGPU.isAvailable() === false) {
            //throw new Error('No WebGPU support');
            return;
        }

        this.renderer = new WebGPURenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.9;

        window.addEventListener('resize', this.onResize.bind(this));

        this.initCamera();
        this.initPostProcessing();

        this.onResize(undefined);
        this.pointerHandler = new Pointer(this.renderer, this.camera, new Plane(new Vector3(0, 1, 0), 0));

        await BlockGeometry.init(); // loading block geomtries
        await this.initEnvironment(); // skybox and ground

        await this.initGrid(); // setup the random grid
        await this.initBlocks(); // create the mesh

        this.clock.start();

        this.renderer.setAnimationLoop(this.animate.bind(this));
    }

    initCamera() {
        // setting the camera so that the scene is vaguely centered and fits the screen, at an angle where the light is gently grazing the objects
        const initCamAngle = -Math.PI * 2 / 3;
        const initCamDist = 100;
        const camOffsetToFit = new Vector3(Math.cos(initCamAngle), 0, Math.sin(initCamDist)).multiplyScalar(10);
        this.camera.position.set(Math.cos(initCamAngle) * initCamDist, 55, Math.sin(initCamAngle) * initCamDist).add(camOffsetToFit);
        this.camera.updateProjectionMatrix();

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxPolarAngle = Math.PI / 2 - Math.PI / 16;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 250;
        // to disable zoom
        this.controls.enableZoom = false;
        // to disable rotation
        this.controls.enableRotate = false;
        // to disable pan
        this.controls.enablePan = false;
        this.controls.target.set(0, 0, 0).add(camOffsetToFit);
        this.controls.update();
    }

    effectController;
    initPostProcessing() {

        /*
        * post-processing set up with :
        * - a scene pass that outputs the color, normal and depth
        * - an ambient occlusion pass that uses the depth and normal to compute the AO
        * - a depth of field pass that uses the AO and the viewZ to compute the blur. Parameters are dynamic and updated in the animate loop
        * - an FXAA pass to antialias the final image
        */
        this.post = new PostProcessing(this.renderer);

        const effectController = {
            focus: uniform(32.0),
            aperture: uniform(100),
            maxblur: uniform(0.02)
        };
        this.effectController = effectController;

        const scenePass = pass(this.scene, this.camera);
        scenePass.setMRT(mrt({
            output: output,
            normal: transformedNormalView
        }));

        const scenePassColor = scenePass.getTextureNode('output');
        const scenePassNormal = scenePass.getTextureNode('normal');
        const scenePassDepth = scenePass.getTextureNode('depth');

        const aoPass = ao(scenePassDepth, scenePassNormal, this.camera);
        aoPass.distanceExponent.value = 1;
        aoPass.distanceFallOff.value = .1;
        aoPass.radius.value = 1.0;
        aoPass.scale.value = 1.5;
        aoPass.thickness.value = 1;

        const blendPassAO = aoPass.getTextureNode().mul(scenePassColor);
        const scenePassViewZ = scenePass.getViewZNode();
        const dofPass = dof(blendPassAO, scenePassViewZ, effectController.focus, effectController.aperture.mul(0.00001), effectController.maxblur);
        const vignetteFactor = clamp(viewportUV.sub(0.5).length().mul(1.2), 0.0, 1.0).oneMinus().pow(0.5);
        this.post.outputNode = fxaa(dofPass.mul(vignetteFactor));
    }

    async initEnvironment() {

        const { scene } = this;

        // loads an ultra hdr skybox to get some nice natural tinting and a few reflections
        // skybox is https://polyhaven.com/a/rustig_koppie_puresky , converted to ultra hdr jpg with with https://gainmap-creator.monogrid.com/
        const texture = await new UltraHDRLoader().setDataType(FloatType).setPath('/ultrahdr/').loadAsync('rustig_koppie_puresky_2k.jpg', (progress) => {
            console.log((progress.loaded / progress.total * 100) + '% skybox loaded');
        });
        texture.mapping = EquirectangularReflectionMapping;
        texture.needsUpdate = true;
        scene.background = texture;
        scene.environment = texture;

        const groundGeom = new PlaneGeometry(148, 148, 1, 1);
        groundGeom.rotateX(-Math.PI * 0.5);
        const groundMat = new MeshStandardNodeMaterial({ color: 0x333333 });
        const groundMesh = new Mesh(groundGeom, groundMat);
        scene.add(groundMesh);
    }

    blocks = [];
    gridZone = new Box2(new Vector2(0, 0), new Vector2(148, 148));
    async initGrid() {
        const zone = this.gridZone;
        const maxBlockSize = new Vector2(5, 5);
        maxBlockSize.x = MathUtils.randInt(1, 5);
        maxBlockSize.y = maxBlockSize.x;

        let px = 0;
        let py = 0;

        // Double array to store the occupation state of the grid. -1 means free, any othe is the block id
        const occupied = Array.from({ length: this.gridZone.max.x }, () =>
            Array(this.gridZone.max.y).fill(-1)
        );

        const squareChance = 0.5;
        // fills the whole grid with blocks of random sizes and colors
        while (py < zone.max.y) {

            while (px < zone.max.x) {
                let maxW = 0;
                const end = Math.min(zone.max.x, px + maxBlockSize.x);
                // check for the maximum width available
                for (let i = px; i < end; i++) {
                    if (occupied[i][py] != -1) {
                        break;
                    }
                    maxW++;
                }
                if (maxW == 0) {
                    px++;
                    continue;
                }

                // create a block entity with random paramaters
                const block = new ABlock();
                const isSquare = MathUtils.randFloat(0, 1) < squareChance;
                block.typeTop = isSquare ? MathUtils.randInt(0, 5) : 0; // only plain rectangles can be ... rectangles
                block.typeBottom = BlockGeometry.topToBottom.get(block.typeTop);
                block.setTopColorIndex(MathUtils.randInt(0, ABlock.LIGHT_COLORS.length - 1));
                // define size and position
                const sx = MathUtils.randInt(1, maxW);
                const sy = isSquare ? sx : MathUtils.randInt(1, maxBlockSize.y);
                block.box.min.set(px, py);
                block.box.max.set(px + sx, py + sy);
                block.height = 1;
                block.rotation = isSquare ? MathUtils.randInt(0, 4) * Math.PI / 2 : MathUtils.randInt(0, 2) * Math.PI;

                this.blocks.push(block);

                // fill occupied grid
                const endX = Math.min(zone.max.x, px + sx);
                const endY = Math.min(zone.max.y, py + sy);
                for (let i = px; i < endX; i++) {
                    for (let j = py; j < endY; j++) {
                        occupied[i][j] = block.id;
                    }
                }
                px += sx;
            }
            py++;
            px = 0;

            // max sizes have a chance to be randomized after every line, to create some structure
            if (MathUtils.randFloat(0, 1) > 0.8) {
                maxBlockSize.x = (MathUtils.randFloat(0, 1) > 0.5) ? 2 : 5;
                maxBlockSize.y = (MathUtils.randFloat(0, 1) > 0.5) ? 2 : 5;
            }

        }
    }


    blockMesh;
    async initBlocks() {

        const matParams = {
            roughness: 0.1,
            metalness: 0.0,
        }
        const mat = new MeshPhysicalNodeMaterial(matParams);
        mat.envMapIntensity = 0.25;

        // evaluate the maximum vertex and index count of the geometries
        const geoms = []
        for (let i = 0; i < BlockGeometry.geoms.length; i++) {
            geoms.push(BlockGeometry.geoms[i]);
        }

        const vCounts = [];
        const iCounts = [];
        let totalV = 0;
        let totalI = 0;
        // get the vertex and index counts for each geometry
        for (let i = 0; i < geoms.length; i++) {
            const g = geoms[i];
            vCounts.push(g.attributes.position.count);
            iCounts.push((g.index).count);
        }

        // calculate the total vertex and index count
        for (let i = 0; i < this.blocks.length; i++) {
            totalV += vCounts[this.blocks[i].typeBottom];
            totalV += vCounts[this.blocks[i].typeTop];
            totalI += iCounts[this.blocks[i].typeBottom];
            totalI += iCounts[this.blocks[i].typeTop];
        }

        // create the mesh
        const maxBlocks = this.blocks.length * 2; // top and bottom
        this.blockMesh = new BatchedMesh(maxBlocks, totalV, totalI, mat);
        this.blockMesh.sortObjects = false; // depends on your use case, here I've had better performances without sorting
        this.blockMesh.position.x = -this.gridZone.max.x * 0.5;
        this.blockMesh.position.z = -this.gridZone.max.y * 0.5;
        this.scene.add(this.blockMesh);

        // setup the geometries and instances
        const geomIds = [];
        for (let i = 0; i < geoms.length; i++) {
            // all our geometries
            geomIds.push(this.blockMesh.addGeometry(geoms[i]));
        }

        // one top and one bottom for each block
        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            this.blockMesh.addInstance(geomIds[block.typeBottom]);
            this.blockMesh.addInstance(geomIds[block.typeTop]);
            this.blockMesh.setColorAt(i * 2, block.baseColor);
            this.blockMesh.setColorAt(i * 2 + 1, block.topColor);
        }
    }



    onResize(e, toSize) {
        const { camera, renderer } = this;
        const size = new Vector2(window.innerWidth, window.innerHeight);
        if (toSize) size.copy(toSize);

        const ww = window.innerWidth;
        const wh = window.innerHeight;
        const aspect = ww / wh;

        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(1);
        renderer.setSize(size.x, size.y);
        renderer.domElement.style.width = `${size.x}px`;
        renderer.domElement.style.height = `${size.y}px`;
    }

    elapsed = 0;
    async animate() {

        const { controls, clock, post } = this;

        const dt = clock.getDelta();
        this.elapsed = clock.getElapsedTime();

        this.updateBlocks(dt, this.elapsed);
        this.updateCamera(dt);
        controls.update(dt);
        await post.renderAsync();

        if (!Demo.firstRenderDone) {
            Demo.firstRenderDone = true;
        }
    }

    themeTransitionStart = -10;
    themeTransitionDuration = 5;
    dummy = new Object3D();
    tempCol = new Color();
    blockSize = new Vector2(1, 1);
    blockCenter = new Vector2();
    heightNoise = new FastSimplexNoise({ frequency: 0.05, octaves: 2, min: 0, max: 1, persistence: 0.5 });
    wavesAmplitude = 8;
    updateBlocks(dt, elapsed) {

        const { camera, raycaster, dummy, blockMesh, blocks, pointerHandler, groundRayPlane, heightNoise, wavesAmplitude, gridZone, blockSize, blockCenter, tempCol, cubicPulse } = this;
        if (blockMesh == null) return;

        // calculate the transition time
        const transitionTime = MathUtils.clamp((elapsed - this.themeTransitionStart) / this.themeTransitionDuration, 0, 1);
        const echoTime = MathUtils.clamp((elapsed - this.themeTransitionStart - 0.3) / this.themeTransitionDuration, 0, 1); // a bit of delay for the second ripple

        let targetHeight = 0;
        let baseI = 0;
        let topI = 0;

        // gets a raycast camera->ground so that the rippling effect is centered on screen
        const camDir = this.camDir;
        if (transitionTime < 1) {
            camera.getWorldDirection(camDir);
            groundRayPlane.constant = camera.position.y * .1;
            const temp = new Vector3().copy(camera.position);
            temp.y -= 10;
            raycaster.set(temp, camDir.normalize());
            raycaster.ray.intersectPlane(this.groundRayPlane, camDir);
        }

        let block;
        let dx = 0;
        let dz = 0;
        let cDist = 0;
        let cFactor = 0;
        let noise = 0;
        let from0 = 0;
        let ripple = 0;
        let echoRipple = 0;

        // update the blocks
        for (let i = 0; i < blocks.length; i++) {
            block = blocks[i];
            // our indices for this block in the batched mesh, a top and a bottom
            baseI = i * 2;
            topI = i * 2 + 1;

            block.box.getSize(blockSize);
            block.box.getCenter(blockCenter);

            // get block offset from pointer
            dx = (blockCenter.x - pointerHandler.scenePointer.x + blockMesh.position.x);
            dz = (blockCenter.y - pointerHandler.scenePointer.z + blockMesh.position.z);

            // calculate the height of the block wrt the distance from the pointer
            cDist = Math.sqrt(dx * dx + dz * dz);
            cFactor = MathUtils.clamp(1 - cDist * 0.1, 0, 1);
            noise = heightNoise.scaled2D(block.box.min.x * .1, block.box.min.y + elapsed * 5);
            targetHeight = noise * wavesAmplitude + 1 + cFactor * 5;

            if (transitionTime < 1) {
                // calculate the ripple effect based on the distance from the center of the screen
                from0 = MathUtils.clamp((Math.sqrt(
                    Math.pow((blockCenter.x - camDir.x) - gridZone.max.x * 0.5, 2) +
                    Math.pow((blockCenter.y - camDir.z) - gridZone.max.y * 0.5, 2)) / gridZone.max.x * .5), 0, 1);
                ripple = cubicPulse(Math.pow(this.gain(transitionTime, 1.1), 0.9), 0.05, from0);
                echoRipple = cubicPulse(this.gain(echoTime, 1.3), 0.025, from0);
                targetHeight += (ripple) * 10 + (echoRipple) * 5;
            }

            // lerp the height of the block
            if (targetHeight >= block.height) { // raises slower than when going down
                block.height = MathUtils.lerp(block.height, targetHeight, .1);
            } else {
                block.height = MathUtils.lerp(block.height, targetHeight, .3);
            }

            // update the block mesh with matrices and colors
            // first the bottom, color changes on the first ripple
            dummy.rotation.y = block.rotation;
            dummy.position.set(blockCenter.x, 0, blockCenter.y);
            dummy.scale.set(blockSize.x, block.height, blockSize.y);
            dummy.updateMatrix();
            blockMesh.setMatrixAt(baseI, dummy.matrix);
            blockMesh.getColorAt(baseI, tempCol);
            tempCol.lerp(this.baseTargetColor, ripple);
            blockMesh.setColorAt(baseI, tempCol);

            // then the top, color changes on the second ripple
            dummy.position.y += block.height;
            dummy.scale.set(blockSize.x, 1, blockSize.y);
            dummy.updateMatrix();
            blockMesh.setMatrixAt(topI, dummy.matrix);
            blockMesh.getColorAt(topI, tempCol);
            tempCol.lerp(this.topTargetColors[block.topColorIndex], echoRipple);
            blockMesh.setColorAt(topI, tempCol);

        }

    }

    raycaster = new Raycaster();
    groundRayPlane = new Plane(new Vector3(0, 1, 0), 0);
    camDist = 50;
    camdistVel = 0.0;
    camK = 0.05;
    camDir = new Vector3();

    // an approximation of an auto-focus effect
    updateCamera(dt) {
        const camDir = this.camDir;
        this.camera.getWorldDirection(camDir);
        this.groundRayPlane.constant = this.camera.position.y * .1;
        this.raycaster.set(this.camera.position, camDir.normalize());
        this.raycaster.ray.intersectPlane(this.groundRayPlane, camDir);
        const dist = camDir.sub(this.camera.position).length();

        const targetDist = dist;
        const distVel = (targetDist - this.camDist) / dt;
        this.camdistVel = MathUtils.lerp(this.camdistVel, distVel, this.camK);
        this.camDist += this.camdistVel * dt;

        this.effectController.focus.value = MathUtils.lerp(this.effectController.focus.value, this.camDist * .85, .05);
        this.effectController.aperture.value = MathUtils.lerp(this.effectController.aperture.value, 100 - this.camDist * .5, .025);
    }

    colorsModes = ['dark', 'light'];
    baseTargetColor = new Color(0x999999);
    topTargetColors = ABlock.LIGHT_COLORS;
    colorMode = this.colorsModes[1];

    setColorMode(mode) {

        this.colorMode = mode;
        this.themeTransitionStart = this.elapsed;
        if (this.colorMode == 'dark') {
            this.baseTargetColor.copy(ABlock.DARK_BASE_COLOR);
            this.topTargetColors = ABlock.DARK_COLORS;

        } else {
            this.baseTargetColor.copy(ABlock.LIGHT_BASE_COLOR);
            this.topTargetColors = ABlock.LIGHT_COLORS;
        }


    }

    /// Inigo Quilez remaping functions https://iquilezles.org/articles/functions/
    pcurve(x, a, b) {
        const k = Math.pow(a + b, a + b) / (Math.pow(a, a) * Math.pow(b, b));
        return k * Math.pow(x, a) * Math.pow(1.0 - x, b);
    }

    gain(x, k) {
        const a = 0.5 * Math.pow(2.0 * ((x < 0.5) ? x : 1.0 - x), k);
        return (x < 0.5) ? a : 1.0 - a;
    }

    cubicPulse(c, w, x) {
        let x2 = Math.abs(x - c);
        if (x2 > w) return 0.0;
        x2 /= w;
        return 1.0 - x2 * x2 * (3.0 - 2.0 * x2);
    }
}