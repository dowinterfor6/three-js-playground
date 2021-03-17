import * as THREE from "three";
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { fragmentShader, vertexShader } from "../assets/shaders/sceneShaders";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from "three/examples/jsm/objects/Sky";
import waterNormals from "../assets/textures/waternormals.jpg";

import CharacterController from "./characterController";
import { Vector3 } from "three";

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
    // this.initWater();
    this.initSun();
    this.updateSun();

    this.initCameraControls();
    this.character = new CharacterController(this.scene);

    this.initGui();
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
    // LinearEncoding needed for water
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color().setHSL(0.1, 0, 1);
    // this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      120,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.set(0, 50, 100);
    // TODO: preferably look at the character position
    this.camera.lookAt(0, 50, 0);
  }

  initLights() {
    // TODO: This color needs to match sky color
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this.hemiLight.position.set(0, 100, 0);
    this.scene.add(this.hemiLight);

    this.hemiLightHelper = new THREE.HemisphereLightHelper(this.hemiLight, 10);
    this.scene.add(this.hemiLightHelper);

    // TODO: This direction needs to match sun pos
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
    this.dirLight.color.setHSL(0.1, 1, 0.95);
    this.dirLight.position.set(-1, 1.75, 0);
    this.dirLight.position.multiplyScalar(30);
    this.scene.add(this.dirLight);

    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;

    const d = 100;

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
    ground.position.y = 0;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  initSky() {
    // const skydomeVertexShader = vertexShader;
    // const skydomeFragmentShader = fragmentShader;
    // const uniforms = {
    //   topColor: { value: new THREE.Color(0x0077ff) },
    //   bottomColor: { value: new THREE.Color(0xffffff) },
    //   offset: { value: 33 },
    //   exponent: { value: 0.6 },
    // };

    // // TODO: These could be refactored
    // uniforms["topColor"].value.copy(this.hemiLight.color);

    // this.scene.fog.color.copy(uniforms["bottomColor"].value);

    // const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    // const skyMat = new THREE.ShaderMaterial({
    //   uniforms,
    //   vertexShader: skydomeVertexShader,
    //   fragmentShader: skydomeFragmentShader,
    //   side: THREE.BackSide,
    // });

    // const sky = new THREE.Mesh(skyGeo, skyMat);

    this.sky = new Sky();
    this.sky.scale.setScalar(45000);
    this.scene.add(this.sky);

    this.skyUniforms = this.sky.material.uniforms;

    this.skyUniforms["turbidity"].value = 10;
    this.skyUniforms["rayleigh"].value = 2;
    this.skyUniforms["mieCoefficient"].value = 0.005;
    this.skyUniforms["mieDirectionalG"].value = 0.8;
  }

  initSun() {
    this.sunPos = new THREE.Vector3();

    // this.sunParameters = {
    //   inclination: 0.49,
    //   azimuth: 0.205,
    // };

    /*
      inclination: 0,
      azimuth: 0
    */

    this.sunParameters = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      inclination: 0,
      azimuth: 0,
      exposure: this.renderer.toneMappingExposure,
    };

    this.sunPmremGenerator = new THREE.PMREMGenerator(this.renderer);
  }

  updateSun() {
    this.skyUniforms["turbidity"].value = this.sunParameters.turbidity;
    this.skyUniforms["rayleigh"].value = this.sunParameters.rayleigh;
    this.skyUniforms[
      "mieCoefficient"
    ].value = this.sunParameters.mieCoefficient;
    this.skyUniforms[
      "mieDirectionalG"
    ].value = this.sunParameters.mieDirectionalG;

    const theta = Math.PI * (this.sunParameters.inclination - 0.5);
    const phi = 2 * Math.PI * (this.sunParameters.azimuth - 0.5);

    this.sunPos.x = Math.cos(phi);
    this.sunPos.y = Math.sin(phi) * Math.sin(theta);
    this.sunPos.z = Math.sin(phi) * Math.cos(theta);

    const { x, y, z } = this.sunPos;
    // console.log(`x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}`);
    /*
      x goes from -1 to 0 to 1 from sunrise to sunset
      y goes from 0 to 1 to 0
      so basically a normal sphere
    */

    // this.sky.material.uniforms["sunPosition"].value.copy(this.sunPos);
    this.skyUniforms["sunPosition"].value.copy(this.sunPos);
    // What exactly is this doing
    // this.water.material.uniforms["sunDirection"].value
    //   .copy(this.sunPos)
    //   .normalize();

    this.renderer.toneMappingExposure = this.sunParameters.exposure;

    // this.scene.environment = this.sunPmremGenerator.fromScene(this.sky).texture;
    this.dirLight.position.x = x;
    this.dirLight.position.y = y;
    this.dirLight.position.z = z;
    this.dirLight.position.multiplyScalar(500);
    this.dirLight.lookAt(0, 0, 0);
  }

  initWater() {
    const waterGeometry = new THREE.PlaneGeometry(45000, 45000);
    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(waterNormals, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      alpha: 1.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
    });
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
  }

  initCameraControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 5000;
    this.controls.update();
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

  initGui() {
    this.gui = new GUI();
    const folderSky = this.gui.addFolder("Sky");
    this.gui
      .add(this.sunParameters, "turbidity", 0.0, 20.0, 0.1)
      .onChange(this.updateSun.bind(this));
    this.gui
      .add(this.sunParameters, "rayleigh", 0.0, 4, 0.001)
      .onChange(this.updateSun.bind(this));
    this.gui
      .add(this.sunParameters, "mieCoefficient", 0.0, 0.1, 0.001)
      .onChange(this.updateSun.bind(this));
    this.gui
      .add(this.sunParameters, "mieDirectionalG", 0.0, 1, 0.001)
      .onChange(this.updateSun.bind(this));
    // this.gui
    //   .add(this.sunParameters, "inclination", 0, 1, 0.0001)
    //   .onChange(this.updateSun.bind(this));
    // this.gui
    //   .add(this.sunParameters, "azimuth", 0, 1, 0.0001)
    //   .onChange(this.updateSun.bind(this));
    this.gui
      .add(this.sunParameters, "exposure", 0, 1, 0.0001)
      .onChange(this.updateSun.bind(this));
    // folderSky
    //   .add(this.sunParameters, "inclination", 0, 0.5, 0.0001)
    //   .onChange(this.updateSun.bind(this));
    // folderSky
    //   .add(this.sunParameters, "azimuth", 0, 1, 0.0001)
    //   .onChange(this.updateSun.bind(this));
    folderSky.open();

    // const waterUniforms = this.water.material.uniforms;

    // const folderWater = this.gui.addFolder("Water");
    // folderWater
    //   .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
    //   .name("distortionScale");
    // folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
    // folderWater.add(waterUniforms.alpha, "value", 0.9, 1, 0.001).name("alpha");
    // folderWater.open();
  }

  render() {
    const delta = this.clock.getDelta();
    this.sunParameters.azimuth = (this.sunParameters.azimuth + 0.0001) % 1;
    this.updateSun();

    this.dirLightHelper.update();
    this.character.update(delta);
    // this.water.material.uniforms["time"].value += 1.0 / 60.0;

    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
  }
}

export default ThreeScene;
