import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "stats.js";
import bk from "../images/corona_bk.png";
import dn from "../images/corona_dn.png";
import ft from "../images/corona_ft.png";
import lf from "../images/corona_lf.png";
import rt from "../images/corona_rt.png";
import up from "../images/corona_up.png";

// Needs a better name tbh
class ThreeScene {
  constructor(containerElement) {
    this.containerElement = containerElement;

    this.init();
    this.initHelpers();
    this.addBox();

    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcce0ff);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000 // TODO: Calculate what's needed for skybox
    );
    this.camera.position.set(25, 25, 25);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // Hacky way to increase resolution?
    this.renderer.setPixelRatio(2 * window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // this.renderer.shadowMap.enabled = true;

    this.containerElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 1000;

    this.stats = new Stats();
    this.containerElement.appendChild(this.stats.dom);

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  addBox() {
    const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xefefef });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

    this.boxGroup = new THREE.Group();
    this.boxGroup.add(line, boxMesh);
    this.scene.add(this.boxGroup);
    const materialArray = [];

    const imgs = [ft, bk, up, dn, rt, lf];
    imgs.forEach((img) => {
      const texture = new THREE.TextureLoader().load(img);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      material.side = THREE.BackSide;
      materialArray.push(material);
    });

    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    const skybox = new THREE.Mesh(skyboxGeo, materialArray);
    this.scene.add(skybox);
  }

  initHelpers() {
    this.axesHelper = new THREE.AxesHelper(10);
    this.scene.add(this.axesHelper);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  simulate(now) {
    this.boxGroup.rotation.x += 0.005;
    this.boxGroup.rotation.y += 0.005;
    // this.boxGroup.rotation.z += 0.005;
  }

  animate(now) {
    requestAnimationFrame(this.animate.bind(this));
    this.simulate(now);
    this.render();
    this.stats.update();
  }
}

export default ThreeScene;
