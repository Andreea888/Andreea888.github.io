import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

// Vectors for Clock Hands
const yAxisClockShort = [];
const yAxisClockLong = [];

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentIntersects = [];

// Added these for raycasting
const raycasterObjects = [];
const hitboxToObjectMap = new Map();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  First: {
    day: "/textures/TextureSetOneDenoised.webp",
  },
  Second: {
    day: "/textures/TextureSetTwoDenoised.webp",
  },
  Third: {
    day: "/textures/TextureSetThreeDenoised.webp",
  },
  Fourth: {
    day: "/textures/TextureSetFourDenoised.webp",
  },
  Fifth: {
    day: "/textures/TextureSetFiveDenoised.webp",
  }
};

const loadedTextures = {
  day: {}
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
});

window.addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", (e) => {
  if(currentIntersects.length>0){
    const object = currentIntersects[0].object;
  }
});

loader.load("/models/Room_Portfolio_Final9_Draco.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;

          if (child.name.includes("Clock")) {
            if (child.name.includes("Short")) {
              yAxisClockShort.push(child);
            }
            if (child.name.includes("Long")) {
              yAxisClockLong.push(child);
            }
          }

          if (child.name.includes("Raycaster")) {
            raycasterObjects.push(child);
            hitboxToObjectMap.set(child, child);
          }

          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      });
    }
  });
  scene.add(glb.scene);
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  40,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(
  13.031835099966989,
  9.464246392610299,
  8.632810466223956,
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

controls.target.set(
  -0.4112058528770441,
  2.0588048808452584,
  -1.5941650731128143,
);

// Event listeners
window.addEventListener("resize", () => {
  controls.update();

  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

});

function animate() { }

const render = () => {
  controls.update();

  // Animate Clock
  const rotationSpeedLong = -0.03;
  const rotationSpeedShort = -0.003;

  yAxisClockLong.forEach((hand) => {
    hand.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotationSpeedLong);
  });

  yAxisClockShort.forEach((hand) => {
    hand.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotationSpeedShort);
  });

  // Raycaster
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray with recursive search enabled
  currentIntersects = raycaster.intersectObjects(raycasterObjects, true);

  for (let i = 0; i < currentIntersects.length; i++) {

  }

  if (currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;
    document.body.style.cursor = "pointer";
  } 
  else {
    document.body.style.cursor = "default";
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
}
render();
