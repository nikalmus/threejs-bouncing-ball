import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { frameCorners } from "three/examples/jsm/utils/CameraUtils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
import monkey from "./images/mk-0-3.glb";
import "./style.css";

let camera, scene, renderer;

let cameraControls;

let dice1, dice2;
let monkeyVarpet;

let portalCamera,
  leftPortal,
  rightPortal,
  leftPortalTexture,
  rightPortalTexture,
  reflectedPosition,
  bottomLeftCorner,
  bottomRightCorner,
  topLeftCorner;

let raycaster, mouse;

async function load3dModel() {
  const loader = new GLTFLoader(loadingManager);
  const gltf = await loader.loadAsync(monkey);
  return gltf.scene.children[0];
}

async function loadImages(images, options = {}) {
  const loader = new THREE.TextureLoader();
  const promises = images.map(async (img) => {
    return new THREE.MeshPhongMaterial({
      map: await loader.loadAsync(img),
      ...options,
    });
  });
  return Promise.all(promises);
}

const loadingManager = new THREE.LoadingManager();

const div = document.createElement("div");
div.setAttribute("class", "progress-bar-container");
document.body.appendChild(div);
const label = document.createElement("label");
label.setAttribute("for", "progress-bar");
label.innerHTML = "Loading...";
div.appendChild(label);
const progress = document.createElement("PROGRESS");
progress.setAttribute("id", "progress-bar");
progress.setAttribute("value", "0");
progress.setAttribute("max", "100");
div.appendChild(progress);

const progressBar = document.getElementById("progress-bar");
console.log("progressBar", progressBar);

loadingManager.onProgress = function (url, loaded, total) {
  progressBar.value = (loaded / total) * 100;
};

const progressBarContainer = document.querySelector(".progress-bar-container");

loadingManager.onLoad = function () {
  progressBarContainer.style.display = "none";
};

async function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;
  renderer.domElement.id = "canvas";
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  //glb
  monkeyVarpet = await load3dModel();
  monkeyVarpet.scale.set(2.5, 2.5, 2.5);
  scene.add(monkeyVarpet);

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

  const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

  // dice
  const portalPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  const geometry = new RoundedBoxGeometry(5, 5, 5, 6, 1);
  const faces = [one, two, three, four, five, six];
  const materialOptions = {
    emissive: 0x333333,
    flatShading: true,
    clippingPlanes: [portalPlane],
    clipShadows: true,
  };
  const materials = await loadImages(faces, materialOptions);

  dice1 = new THREE.Mesh(geometry, materials);
  scene.add(dice1);
  dice2 = new THREE.Mesh(geometry, materials);
  scene.add(dice2);

  // portals
  const pFOV = 45;
  const pAspectRatio = 1;
  const pNear = 0.1;
  const pFar = 500;

  portalCamera = new THREE.PerspectiveCamera(pFOV, pAspectRatio, pNear, pFar);

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

  rightPortalTexture = new THREE.WebGLRenderTarget(256, 256, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
  });

  leftPortal = new THREE.Mesh(
    planeGeo,
    new THREE.MeshBasicMaterial({ map: leftPortalTexture.texture })
  );
  leftPortal.position.x = -25;
  leftPortal.position.y = 10;
  leftPortal.scale.set(0.2, 0.4, 0.2);
  scene.add(leftPortal);

  rightPortal = new THREE.Mesh(
    planeGeo,
    new THREE.MeshBasicMaterial({ map: rightPortalTexture.texture })
  );
  rightPortal.position.x = 25;
  rightPortal.position.y = 10;
  rightPortal.scale.set(0.2, 0.4, 0.2);
  scene.add(rightPortal);

  // walls
  const loader = new THREE.TextureLoader();

  const planeTop = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  planeTop.position.y = 100;
  planeTop.rotateX(Math.PI / 2);
  scene.add(planeTop);

  const floorTexture = await loader.loadAsync(floor);
  const floorPlane = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: floorTexture })
  );
  floorPlane.rotateX(-Math.PI / 2);
  scene.add(floorPlane);

  const wallTexture = await loader.loadAsync(wall);
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
    new THREE.MeshPhongMaterial({ map: wallTexture })
  );
  backWallPlane.position.z = -50;
  backWallPlane.position.y = 50;
  scene.add(backWallPlane);

  const monkeyGeo = new THREE.PlaneGeometry(67.2, 86.8);
  const monkeyTexture = await loader.loadAsync(forgetMonkeys);
  const monkeyPlain = new THREE.Mesh(
    monkeyGeo,
    new THREE.MeshPhongMaterial({ map: monkeyTexture })
  );
  monkeyPlain.position.z = -49;
  monkeyPlain.position.y = 50;
  monkeyPlain.userData = { URL: "https://duckduckgo.com/" };
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
  const portraitTexture = await loader.loadAsync(portrait);
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
  mainLight.position.y = 100; //used to be 7
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
  const body = document.querySelector("body");
  body.style.cursor = "default";
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0 && intersects[0].object.userData.URL) {
    body.style.cursor = "pointer";
  }
}

function handleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0 && intersects[0].object.userData.URL) {
    window.open(intersects[0].object.userData.URL);
  }
}

function renderPortal(thisPortal, otherPortal, thisPortalTexture) {
  thisPortal.worldToLocal(reflectedPosition.copy(camera.position));
  reflectedPosition.x *= -1.0;
  reflectedPosition.z *= -1.0;
  otherPortal.localToWorld(reflectedPosition);
  portalCamera.position.copy(reflectedPosition);

  otherPortal.localToWorld(bottomLeftCorner.set(50.05, -50.05, 0.0));
  otherPortal.localToWorld(bottomRightCorner.set(-50.05, -50.05, 0.0));
  otherPortal.localToWorld(topLeftCorner.set(50.05, 50.05, 0.0));
  // projection matrix to include the portal's frame
  //CameraUtils.frameCorners(
  frameCorners(
    portalCamera,
    bottomLeftCorner,
    bottomRightCorner,
    topLeftCorner,
    false
  );

  thisPortalTexture.texture.encoding = renderer.outputEncoding;
  renderer.setRenderTarget(thisPortalTexture);
  renderer.state.buffers.depth.setMask(true);
  if (renderer.autoClear === false) renderer.clear();
  thisPortal.visible = false;
  renderer.render(scene, portalCamera);
  thisPortal.visible = true;
}

function animate() {
  requestAnimationFrame(animate);

  const timerOne = Date.now() * 0.01;
  const timerTwo = timerOne + Math.PI * 10.0;
  const timerThree = timerTwo + Math.PI * 20.0;

  dice1.position.set(
    Math.cos(timerOne * 0.1) * 30,
    Math.abs(Math.cos(timerOne * 0.2)) * 20 + 5,
    Math.sin(timerOne * 0.1) * 30
  );
  dice1.rotation.y = Math.PI / 2 - timerOne * 0.1;
  dice1.rotation.z = timerOne * 0.8;

  dice2.position.set(
    Math.cos(timerTwo * 0.1) * 30,
    Math.abs(Math.cos(timerTwo * 0.2)) * 20 + 5,
    Math.sin(timerTwo * 0.1) * 30
  );
  dice2.rotation.y = Math.PI / 2 - timerTwo * 0.1;
  dice2.rotation.z = timerTwo * 0.8;

  monkeyVarpet.position.set(
    Math.cos(timerThree * -0.2) * 20,
    Math.abs(Math.cos(timerThree * 0.2)) * 15 + 5,
    monkeyVarpet.geometry.boundingSphere.radius * 2 + 1
  );

  monkeyVarpet.rotation.y = Math.PI / 2 - timerThree * 0.1;
  const currentRenderTarget = renderer.getRenderTarget();
  const currentXrEnabled = renderer.xr.enabled;
  const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
  renderer.xr.enabled = false;
  renderer.shadowMap.autoUpdate = false;

  renderPortal(leftPortal, rightPortal, leftPortalTexture);
  renderPortal(rightPortal, leftPortal, rightPortalTexture);

  renderer.xr.enabled = currentXrEnabled;
  renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
  renderer.setRenderTarget(currentRenderTarget);

  renderer.render(scene, camera);
}

async function main() {
  await init();
  animate();
}

main();
