import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import gsap from "gsap";
import { Howl } from 'howler'


const canvas = document.querySelector("#experience-canvas");

const isMobile = navigator.userAgent.includes("Mobi");

var backgroundMusic = new Howl({
  src: ["./music/Room_Music.ogg"],
  loop: true,
  volume: 1,
});

var lamp = new Howl({
 src: ["./music/lamp.ogg"],
 loop: false,
 volume: 1,
});

var click = new Howl({
 src: ["./music/click.ogg"],
 loop: false,
 volume: 1,
});



let isMusicPlaying = true;

export function muteMusic(){
    isMusicPlaying = !isMusicPlaying;
    if(isMusicPlaying){
        backgroundMusic.play();
    }
    else{
        backgroundMusic.pause();
    }
}

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

let isNightMode = false; //default day mode

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");

let canRender=false;
let touchHappened = false;

manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid rgb(229, 137, 155)";
  loadingScreenButton.style.background = "#fcaec0";
  loadingScreenButton.style.color = "#e6dede";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
  loadingScreenButton.textContent = "Enter!";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
  let isDisabled = false;


  function handleEnter() {
    if (isDisabled) return;

    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "8px solid rgb(229, 137, 155)";
    loadingScreenButton.style.background = "#fcaec0";
    loadingScreenButton.style.color = "#e6dede";
    loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
    loadingScreenButton.textContent = "WELCOME! ♡";
    loadingScreen.style.background = "	#ffd1e7";
    isDisabled = true;
    canRender = true;
    backgroundMusic.play();
    playReveal();
  }

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  ["click", "touchend"].forEach(event => {
  loadingScreenButton.addEventListener(event, (e) => {
    e.preventDefault();
    handleEnter();
  }, { passive: false });
});


  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
};

function playReveal() {
  const tl = gsap.timeline();

  tl.to(loadingScreen, {
    scale: 0.5,
    duration: 1.2,
    delay: 0.25,
    ease: "back.in(1.8)",
  }).to(
    loadingScreen,
    {
      y: "200vh",
      transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
      duration: 1.2,
      ease: "back.in(1.8)",
      onComplete: () => {
        isModalOpen = false;


      },
    },
    "-=0.1"
  );
}


function handleThemeToggle() {

  isNightMode = !isNightMode;
  document.body.classList.remove("day", "night");
  document.body.classList.add(isNightMode ? "night" : "day");

  room.traverse((child) => {
  if (child.isMesh && child.material instanceof THREE.MeshBasicMaterial) {
    // Find a texture key that is included in the mesh name
    const textureKey = Object.keys(loadedTextures.day).find(key => child.name.includes(key));

    if (textureKey) {
      child.material.map = isNightMode
        ? loadedTextures.night[textureKey]
        : loadedTextures.day[textureKey];
      child.material.needsUpdate = true;
    }
  }
  });
  if(isNightMode){
    scene.background = new THREE.Color(0x121111); //dark grey
  }
  else{
    scene.background = new THREE.Color(0xffffff); //white
    
  }
}




// Vectors for Clock Hands
const yAxisClockShort = [];
const yAxisClockLong = [];

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentIntersects = [];
let currentHoveredObject = null;

// For raycasting
const raycasterObjects = [];
const hitboxToObjectMap = new Map();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);



const textureMap = {
  First: {
    day: "/textures/TextureSetOneDenoised.webp",
    night: "/textures/TextureSetOneDenoisedDark.webp",
  },
  Second: {
    day: "/textures/TextureSetTwoDenoised.webp",
    night: "/textures/TextureSetTwoDenoisedDark.webp",
  },
  Third: {
    day: "/textures/TextureSetThreeDenoised.webp",
    night: "/textures/TextureSetThreeDenoisedDark.webp",
  },
  Fourth: {
    day: "/textures/TextureSetFourDenoised.webp",
    night: "/textures/TextureSetFourDenoisedDark.webp",
  },
  Fifth: {
    day: "/textures/TextureSetFiveDenoised.webp",
    night: "/textures/TextureSetFiveDenoisedDark.webp",
  },
  
};

const loadedTextures = {
  day: {},
  night: {},
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
    click.play();
    hideModal(modal);
  }, 
  {passive : false});

  if(!isMobile){
    button.addEventListener(
      "click", 
      (e)=>{
      const modal = e.target.closest(".modal");
      click.play();
      hideModal(modal);
    }, 
    {passive : false});
  }

});


window.addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function checkHovering() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycasterObjects, true); //array that keeps the intersected objects from my raycasterObjects array (interactable objects array)

  if (intersects.length > 0) { //if something was intersected
    const firstHit = intersects[0].object; //take the first intersected object

    if (firstHit !== currentHoveredObject) { //if the current intersected is different than the previous
      if (currentHoveredObject) { //if a previous hovered exists,
        playHoverAnimation(currentHoveredObject, false); //return the previous to default state animation
      }
      //play the animation for firstHit (current hovered object)
      if (firstHit.name.includes("Button") || firstHit.name.includes("Lamp")) {
        currentHoveredObject = firstHit;
        playHoverAnimation(firstHit, true);
        document.body.style.cursor = "pointer";
      } else {
        currentHoveredObject = null;
        document.body.style.cursor = "default";
      }
    }
  } else { //nothing is being hovered
    if (currentHoveredObject) {
      playHoverAnimation(currentHoveredObject, false); //stop animation
      currentHoveredObject = null; //no current hovered object
      document.body.style.cursor = "default";
    }
  }
}


function handleRaycasterInteraction(){
  if(currentIntersects.length>0){
    const object = currentIntersects[0].object;
    if(object.name.includes("Work_Button")){
      click.play();
      showModal(modals.work);
    }
    else if(object.name.includes("About_Button")){
      click.play();
      showModal(modals.about);
    }
    else if(object.name.includes("Contact_Button")){
      click.play();
      showModal(modals.contact);
    }
    else if(object.name.includes("Lamp")){
      lamp.play();
      handleThemeToggle();
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
  dayTexture.minFilter = THREE.LinearFilter;
  dayTexture.magFilter = THREE.LinearFilter;
  loadedTextures.day[key] = dayTexture;

  // Load and configure night texture
  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.minFilter = THREE.LinearFilter;
  nightTexture.magFilter = THREE.LinearFilter;
  loadedTextures.night[key] = nightTexture;
});

let room;

loader.load("/models/Room_Portfolio_Final20.glb", (glb) => {
  room = glb.scene;
  room.traverse((child) => {
    if (child.isMesh) {
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          
          const texture = isNightMode ? loadedTextures.night[key] : loadedTextures.day[key];

          const material = new THREE.MeshBasicMaterial({
            map: texture,
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
  scene.add(room);
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
  gsap.killTweensOf(object.position);
  object.userData.isAnimating = true;
  if (isHovering){
    if (object.name.includes("Work")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
      gsap.to(object.rotation,{
      x: object.userData.initialRotation.x + Math.PI / 8,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
    }
    else if (object.name.includes("About")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "back.out(1.8)",      });
      gsap.to(object.rotation,{
      x: object.userData.initialRotation.x - Math.PI / 8,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
    }
    if (object.name.includes("Contact")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
      gsap.to(object.rotation,{
      x: object.userData.initialRotation.x + Math.PI/10,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
    }
    if (object.name.includes("Lamp")){
      gsap.to(object.scale,{
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
      gsap.to(object.position,{
      y: object.userData.initialPosition.y + 0.1 ,
      duration: 0.3,
      ease: "back.out(1.8)",
      });
    }

  }
  else{
    gsap.to(object.scale,{
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      //ease: "bounce.out(1.8)",
    });
    gsap.to(object.rotation,{
      x: object.userData.initialRotation.x,
      duration: 0.3,
      //ease: "bounce.out(1.8)",
      
    });
    gsap.to(object.position,{
      x: object.userData.initialPosition.x,
      y: object.userData.initialPosition.y,
      z: object.userData.initialPosition.z,
      duration: 0.3,
      //ease: "bounce.in(1.8)",
    });
  }
}


const render = () => {
  controls.update();
  checkHovering();
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
  if(canRender){
    renderer.render(scene, camera);
  }

  window.requestAnimationFrame(render);
}
render();
