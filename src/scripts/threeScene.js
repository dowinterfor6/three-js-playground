import * as THREE from "three";
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { fragmentShader, vertexShader } from "../assets/shaders/sceneShaders";

import CharacterController from "./characterController";

class ThreeScene {
  constructor(containerElement) {
    this.containerElement = containerElement;
    this.clock = new THREE.Clock();
    this.mixers = [];

    this.init();
    this.animate();
  }

  init() {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initGround();
    this.initSky();
    this.initCameraControls();
    this.character = new CharacterController(this.scene);

    this.initAxesHelper();
    this.initStats();
    this.initResizeListener();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // Hacky way to increase resolution?
    this.renderer.setPixelRatio(2 * window.devicePixelRatio);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerElement.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color().setHSL(0.1, 0, 1);
    this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      120,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.set(0, 0, 250);
  }

  initLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.hemiLightHelper = new THREE.HemisphereLightHelper(this.hemiLight, 10);
    this.scene.add(this.hemiLightHelper);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
    this.dirLight.color.setHSL(0.1, 1, 0.95);
    this.dirLight.position.set(-1, 1.75, 0);
    this.dirLight.position.multiplyScalar(30);
    this.scene.add(this.dirLight);

    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;

    const d = 50;

    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;

    this.dirLight.shadow.camera.far = 3500;
    this.dirLight.shadow.bias = -0.0001;

    this.dirLightHelper = new THREE.DirectionalLightHelper(this.dirLight, 10);
    this.scene.add(this.dirLightHelper);
  }

  initGround() {
    const groundGeo = new THREE.PlaneGeometry(10000, 10000);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    groundMat.color.setHSL(0.095, 1, 0.75);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -33;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  initSky() {
    const skydomeVertexShader = vertexShader;
    const skydomeFragmentShader = fragmentShader;
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    };

    // TODO: These could be refactored
    uniforms["topColor"].value.copy(this.hemiLight.color);

    this.scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: skydomeVertexShader,
      fragmentShader: skydomeFragmentShader,
      side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  initCameraControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 5000;
  }

  initResizeListener() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initAxesHelper() {
    this.axesHelper = new THREE.AxesHelper(50);
    this.scene.add(this.axesHelper);
  }

  initStats() {
    this.stats = new Stats();
    this.containerElement.appendChild(this.stats.dom);
  }

  render() {
    const delta = this.clock.getDelta();

    // this.dirLight.position.x += 0.1;
    // this.dirLightHelper.update();
    this.character.update(delta);

    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
  }
}

export default ThreeScene;
