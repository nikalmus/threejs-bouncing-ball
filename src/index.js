import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { frameCorners } from "three/examples/jsm/utils/CameraUtils";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import forgetMonkeys from "./images/forgetMonkeys.jpg";
import portrait from "./images/portrait.jpg";
import wall from "./images/wall.jpg";
import one from "./images/1.png";
import two from "./images/2.png";
import three from "./images/3.png";
import four from "./images/4.png";
import five from "./images/5.png";
import six from "./images/6.png";
import floor from "./images/floor.jpg";
import monkey from "./images/mk1.glb";

let camera, scene, renderer;

let cameraControls;

let smallSphereOne, smallSphereTwo;
let monkeyVarpet;

let portalCamera,
  leftPortal,
  rightPortal,
  leftPortalTexture,
  reflectedPosition,
  rightPortalTexture,
  bottomLeftCorner,
  bottomRightCorner,
  topLeftCorner;

let raycaster, mouse;

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;
  renderer.domElement.id = "canvas";
  document.body.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.set(0, 75, 160);

  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 40, 0);
  cameraControls.maxDistance = 400;
  cameraControls.minDistance = 10;
  cameraControls.update();

  //

  const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

  // bouncing dice
  const portalPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.0);
  const geometry = new RoundedBoxGeometry(5,5,5,6,1);
  const faces = [one, two, three, four, five, six];
  const materials = faces.map((face) => new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load(face),
    emissive: 0x333333,
    flatShading: true,
    clippingPlanes: [portalPlane],
    clipShadows: true,
  }));
  smallSphereOne = new THREE.Mesh(geometry, materials);
  scene.add(smallSphereOne);
  smallSphereTwo = new THREE.Mesh(geometry, materials);
  scene.add(smallSphereTwo);

   //glb model
   const loader = new GLTFLoader();

   loader.load( monkey, function ( gltf ) {
   gltf.scene.scale.set(2,2,2)
   monkeyVarpet = gltf.scene.children[0]
   monkeyVarpet.position.set(3,6,10)
   //gltf.scene.position.set(3,6,10)
   scene.add( monkeyVarpet );
   //const blueLight2 = new THREE.PointLight(0xff0000, 0.25, 1000);
   //blueLight2.position.set(10, 1, 28);
   //scene.add(blueLight2);
 }, undefined, function ( error ) {
 
   console.error( error );
 
 } );

  // portals
  portalCamera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 500.0);
  scene.add(portalCamera);
  bottomLeftCorner = new THREE.Vector3();
  bottomRightCorner = new THREE.Vector3();
  topLeftCorner = new THREE.Vector3();
  reflectedPosition = new THREE.Vector3();

  leftPortalTexture = new THREE.WebGLRenderTarget(256, 256, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
  });
  leftPortal = new THREE.Mesh(
    planeGeo,
    new THREE.MeshBasicMaterial({ map: leftPortalTexture.texture })
  );
  leftPortal.position.x = -30;
  leftPortal.position.y = 20;
  leftPortal.scale.set(0.35, 0.35, 0.35);
  scene.add(leftPortal);

  rightPortalTexture = new THREE.WebGLRenderTarget(256, 256, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
  });
  rightPortal = new THREE.Mesh(
    planeGeo,
    new THREE.MeshBasicMaterial({ map: rightPortalTexture.texture })
  );
  rightPortal.position.x = 30;
  rightPortal.position.y = 20;
  rightPortal.scale.set(0.35, 0.35, 0.35);
  scene.add(rightPortal);

  // walls
  const planeTop = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  planeTop.position.y = 100;
  planeTop.rotateX(Math.PI / 2);
  scene.add(planeTop);

  const floorTexture = new THREE.TextureLoader().load(floor);
  const floorPlane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: floorTexture })
  );
  floorPlane.rotateX(-Math.PI / 2);
  scene.add(floorPlane);

  const wallTexture = new THREE.TextureLoader().load(wall);
  const frontWallPlane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: wallTexture })
  );
  frontWallPlane.position.z = 50;
  frontWallPlane.position.y = 50;
  frontWallPlane.rotateY(Math.PI);
  scene.add(frontWallPlane);

  const backWallPlane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map:  wallTexture})
  );
  backWallPlane.position.z = -50;
  backWallPlane.position.y = 50;
  //planeBack.rotateY( Math.PI );
  scene.add(backWallPlane);

  const monkeyGeo = new THREE.PlaneGeometry(67.2, 86.8);
  const monkeyTexture = new THREE.TextureLoader().load(forgetMonkeys);
  const monkeyPlain = new THREE.Mesh(
    monkeyGeo,
    new THREE.MeshPhongMaterial({ map:  monkeyTexture})
  );
  monkeyPlain.position.z = -49;
  monkeyPlain.position.y = 50;
  //monkeyPlain.rotateY( Math.PI );
  monkeyPlain.userData = { URL: "https://duckduckgo.com/"};
  scene.add(monkeyPlain);


  const rightWallPlane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: wallTexture })
  );
  rightWallPlane.position.x = 50;
  rightWallPlane.position.y = 50;
  rightWallPlane.rotateY(-Math.PI / 2);
  scene.add(rightWallPlane);

  const leftWallPlane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: wallTexture })
  );

  leftWallPlane.position.x = -50;
  leftWallPlane.position.y = 50;
  leftWallPlane.rotateY(Math.PI / 2);
  scene.add(leftWallPlane);

  const portraitGeo = new THREE.PlaneGeometry(30, 38);
  const portraitTexture = new THREE.TextureLoader().load(portrait);
  const portraitPlane = new THREE.Mesh(
    portraitGeo,
    new THREE.MeshPhongMaterial({ map: portraitTexture })
  );

  portraitPlane.position.x = -49;
  portraitPlane.position.y = 60;
  portraitPlane.rotateY(Math.PI / 2);
  scene.add(portraitPlane);

  // lights
  const mainLight = new THREE.PointLight(0xcccccc, 1.5, 250);
  mainLight.position.y = 7;
  mainLight.position.z = 30;
  scene.add(mainLight);

  const greenLight = new THREE.PointLight(0x00ff00, 0.25, 1000);
  greenLight.position.set(550, 50, 0);
  scene.add(greenLight);

  const redLight = new THREE.PointLight(0xff0000, 0.25, 1000);
  redLight.position.set(-550, 50, 0);
  scene.add(redLight);

  const blueLight = new THREE.PointLight(0x7f7fff, 0.25, 1000);
  blueLight.position.set(0, 50, 550);
  scene.add(blueLight);

  //events
  window.addEventListener("resize", onWindowResize);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener("click", handleClick);
  window.addEventListener("mousemove", handleHover); 
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleHover(event) {
  const body = document.querySelector('body');
  body.style.cursor = 'default'
  mouse.x = (event.clientX / window.innerWidth) * 2 -1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0 && intersects[0].object.userData.URL) {
      body.style.cursor = 'pointer'
  }
} 

function handleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 -1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0 && intersects[0].object.userData.URL) {
      window.open(intersects[0].object.userData.URL);
  }
} 

function renderPortal(thisPortalMesh, otherPortalMesh, thisPortalTexture) {
  // set the portal camera position to be reflected about the portal plane
  thisPortalMesh.worldToLocal(reflectedPosition.copy(camera.position));
  reflectedPosition.x *= -1.0;
  reflectedPosition.z *= -1.0;
  otherPortalMesh.localToWorld(reflectedPosition);
  portalCamera.position.copy(reflectedPosition);

  // grab the corners of the other portal
  // - note: the portal is viewed backwards; flip the left/right coordinates
  otherPortalMesh.localToWorld(bottomLeftCorner.set(50.05, -50.05, 0.0));
  otherPortalMesh.localToWorld(bottomRightCorner.set(-50.05, -50.05, 0.0));
  otherPortalMesh.localToWorld(topLeftCorner.set(50.05, 50.05, 0.0));
  // set the projection matrix to encompass the portal's frame
  //CameraUtils.frameCorners(
  frameCorners(
    portalCamera,
    bottomLeftCorner,
    bottomRightCorner,
    topLeftCorner,
    false
  );

  // render the portal
  thisPortalTexture.texture.encoding = renderer.outputEncoding;
  renderer.setRenderTarget(thisPortalTexture);
  renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897
  if (renderer.autoClear === false) renderer.clear();
  thisPortalMesh.visible = false; // hide this portal from its own rendering
  renderer.render(scene, portalCamera);
  thisPortalMesh.visible = true; // re-enable this portal's visibility for general rendering
}

function animate() {
  requestAnimationFrame(animate);

  // move the bouncing sphere(s)
  const timerOne = Date.now() * 0.01;
  const timerTwo = timerOne + Math.PI * 10.0;
  const timerThree = timerTwo + Math.PI * 20.0;

  smallSphereOne.position.set(
    Math.cos(timerOne * 0.1) * 30,
    Math.abs(Math.cos(timerOne * 0.2)) * 20 + 5,
    Math.sin(timerOne * 0.1) * 30
  );
  smallSphereOne.rotation.y = Math.PI / 2 - timerOne * 0.1;
  smallSphereOne.rotation.z = timerOne * 0.8;

  smallSphereTwo.position.set(
    Math.cos(timerTwo * 0.1) * 30,
    Math.abs(Math.cos(timerTwo * 0.2)) * 20 + 5,
    Math.sin(timerTwo * 0.1) * 30
  );
  smallSphereTwo.rotation.y = Math.PI / 2 - timerTwo * 0.1;
  smallSphereTwo.rotation.z = timerTwo * 0.8;


  monkeyVarpet.position.set(
    Math.cos(timerThree * -0.2) * 20,
    Math.abs(Math.cos(timerThree * 0.2)) * 15 + 5, // 15 changed to 30, jumps higher
    //also, Math.cos(timerThree * 0.2) bounces synced between dice and varpet.
    //if change 0.2 to 0.5 for each die bounce 3 bounces of varpet
    //Math.sin(timerThree * 0.1) * 15
  );
  monkeyVarpet.rotation.y = Math.PI / 2 - timerThree * 0.1; //bounce
  //monkeyVarpet.rotation.y = Math.PI / 2 - timerThree; //spins & bounce

  //monkeyVarpet.rotation.z = timerThree * 0.8; //not interesting to rotate z

  // save the original camera properties
  const currentRenderTarget = renderer.getRenderTarget();
  const currentXrEnabled = renderer.xr.enabled;
  const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
  renderer.xr.enabled = false; // Avoid camera modification
  renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

  // render the portal effect
  renderPortal(leftPortal, rightPortal, leftPortalTexture);
  renderPortal(rightPortal, leftPortal, rightPortalTexture);

  // restore the original rendering properties
  renderer.xr.enabled = currentXrEnabled;
  renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
  renderer.setRenderTarget(currentRenderTarget);

  // render the main scene
  renderer.render(scene, camera);
}

init();
animate();
