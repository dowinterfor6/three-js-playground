import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import flamingo from "../assets/models/gltf/Flamingo.glb";

class CharacterController {
  constructor(scene) {
    this.scene = scene;
    this.mixers = [];

    this.initModel();
  }

  initModel() {
    const loader = new GLTFLoader();

    loader.load(flamingo, (gltf) => {
      const mesh = gltf.scene.children[0];

      const s = 0.35;
      mesh.scale.set(s, s, s);
      mesh.position.y = 50;
      mesh.rotation.y = -1;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.scene.add(mesh);

      const mixer = new THREE.AnimationMixer(mesh);
      mixer.clipAction(gltf.animations[0]).setDuration(1).play();
      this.mixers.push(mixer);
    });
  }

  update(delta) {
    this.mixers.forEach((mixer) => {
      mixer.update(delta);
    });
  }
}

export default CharacterController;
