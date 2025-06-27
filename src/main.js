import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

const canvas = document.querySelector("#experience-canvas");
const sizes={
  height: window.innerHeight,
  width : window.innerWidth
}

//Loaders
const textureLoader = new THREE.TextureLoader();

//Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

const textureMap = {
  First:{
    day:"/textures/TextureSetOneDenoised.webp",
  },
  Second:{
    day:"/textures/TextureSetTwoDenoised.webp",
  },
  Third:{
    day:"/textures/TextureSetThreeDenoised.webp",
  },
  Fourth:{
    day:"/textures/TextureSetFourDenoised.webp",
  },
  Fifth:{
    day:"/textures/TextureSetFiveDenoised.webp",
  }
};

const loadedTextures = {
  day: {}
};

Object.entries(textureMap).forEach(([key, paths])=>{
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
});

loader.load("/models/Room_Portfolio_Final7_Draco.glb", (glb)=> {
  glb.scene.traverse((child)=>{
    if(child.isMesh){
      Object.keys(textureMap).forEach((key)=>{
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;

          if(child.material.map){
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


const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


//const geometry = new THREE.BoxGeometry( 1, 1, 1 );
//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );



const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

controls.target.set(

-0.4112058528770441,

2.0588048808452584,

-1.5941650731128143,
);

// Event listeners

window.addEventListener("resize", ()=>{
  controls.update();

  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
});

function animate() {}

const render = ( ) =>{
  controls.update();

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}
render();