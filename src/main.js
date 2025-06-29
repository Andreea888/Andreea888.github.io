import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import gsap from "gsap";

const canvas = document.querySelector("#experience-canvas");

const isMobile = navigator.userAgent.includes("Mobi");

const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

let isModalOpen = false;

const showModal = (modal) => {
  isModalOpen = true;
  modal.style.display = "block";
  controls.enabled = false;
  if(currentHoveredObject){
    playHoverAnimation(currentHoveredObject, false);
    currentHoveredObject = null;
  }
  document.body.style.cursor = "default";
  currentIntersects = [];

  gsap.set(modal, {
    opacity: 0,
    scale: 0.8,  
  });
  gsap.to(modal, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    ease: "back.out(1.7)",  
  });
};


const hideModal = (modal) => {
  isModalOpen = false;
  modal.style.display = "block";
  controls.enabled = true;
  gsap.to(modal, {
    opacity: 0,
    scale:0.4,
    duration: 0.3, 
    onComplete: () => {
      modal.style.display= "none";
    }
  });
}
//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Vectors for Clock Hands
const yAxisClockShort = [];
const yAxisClockLong = [];

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentIntersects = [];
let currentHoveredObject = null;

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

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),

};

///EVENT LISTENERS



document.querySelectorAll(".modal-exit-button").forEach(button => {
  button.addEventListener(
    "touchend", 
    (e)=>{
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, 
  {passive : false});

  if(!isMobile){
    button.addEventListener(
      "click", 
      (e)=>{
      const modal = e.target.closest(".modal");
      hideModal(modal);
    }, 
    {passive : false});
  }

});


window.addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function handleRaycasterInteraction(){
  if(currentIntersects.length>0){
    const object = currentIntersects[0].object;
    if(object.name.includes("Work_Button")){
      showModal(modals.work);
    }
    else if(object.name.includes("About_Button")){
      showModal(modals.about);
    }
    else if(object.name.includes("Contact_Button")){
      showModal(modals.contact);
    }
  }
}

window.addEventListener("click", handleRaycasterInteraction);

window.addEventListener(
  "touchstart",
  (e) => {
    if(isModalOpen) return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (e) => {
    if(isModalOpen) return;
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

///TEXTURES

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
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

          if(child.name.includes("Button")){
            child.userData.initialScale = new THREE.Vector3().copy(child.scale);
            child.userData.initialPosition = new THREE.Vector3().copy(child.position);
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
            
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


const fov = isMobile ? 80 : 40;
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 1000);

camera.position.set(
  13.031835099966989,
  9.464246392610299,
  8.632810466223956,
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);

controls.maxPolarAngle = 1.3; //Maximum going down
controls.minPolarAngle = 0; //Maximum going up

controls.minAzimuthAngle = -Math.PI / 15; //Maximum going left
controls.maxAzimuthAngle = Math.PI / 1.9; //Maximum going right 

controls.minDistance = 5; //zoom in
controls.maxDistance = 50; //zoom out

controls.maxTargetRadius= 5;




controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

controls.target.set(
  -0.4112058528770441,
  2.0588048808452584,
  -1.5941650731128143,
);

///EVENT LISTENER FOR UPDATING SCREEN

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

function playHoverAnimation(object, isHovering){
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.scale);
  object.userData.isAnimating = true;
  if (isHovering){
    if (object.name.includes("Work")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      });
      gsap.to(object.rotation,{
      x: object.userData.initialRotation.x + Math.PI / 8,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      });
    }
    else if (object.name.includes("About")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      });
      gsap.to(object.rotation,{
      x: object.userData.initialRotation.x - Math.PI / 8,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      });
    }
    if (object.name.includes("Contact")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      });
      gsap.to(object.rotation,{
      x: object.userData.initialRotation.x + Math.PI/10,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      });
    }

  }
  else{
    gsap.to(object.scale,{
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
    });
    gsap.to(object.rotation,{
      x: object.userData.initialRotation.x,
      duration: 0.3,
      ease: "bouncte.out(1.8)",
      
    });
  }
}

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
  if(!isModalOpen){
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray with recursive search enabled
    currentIntersects = raycaster.intersectObjects(raycasterObjects, true);

    for (let i = 0; i < currentIntersects.length; i++) {
    
    }

    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;
      if (currentIntersectObject.name.includes("Button")){
        if(currentIntersectObject !== currentHoveredObject){
          if(currentHoveredObject){
            playHoverAnimation(currentHoveredObject, false);
          }
          playHoverAnimation(currentIntersectObject, true);
          currentHoveredObject = currentIntersectObject;
        }
      }
      document.body.style.cursor = "pointer";
    } 
    else {
      if(currentHoveredObject){
        playHoverAnimation(currentHoveredObject, false);
      }
      document.body.style.cursor = "default";
    }
  }
  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
}
render();
