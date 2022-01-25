import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { frameCorners } from "three/examples/jsm/utils/CameraUtils";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import rightWall from "./images/rightWall.jpg";
import leftWall from "./images/leftWall.jpg";
import backWall from "./images/backWall.jpg";
import forgetMonkeys from "./images/forgetMonkeys.jpg";
import wall from "./images/wall.jpg";
import one from "./images/1.png";
import two from "./images/2.png";
import three from "./images/3.png";
import four from "./images/4.png";
import five from "./images/5.png";
import six from "./images/6.png";
import floor from "./images/floor.jpg";


let camera, scene, renderer;

let cameraControls;

let smallSphereOne, smallSphereTwo;

let portalCamera,
  leftPortal,
  rightPortal,
  leftPortalTexture,
  reflectedPosition,
  rightPortalTexture,
  bottomLeftCorner,
  bottomRightCorner,
  topLeftCorner;


  
  function handleHover(event) { //does not work
    event.preventDefault();
    console.log(event)
    mouse.x = (event.clientX / window.innerWidth) * 2 -1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    console.log('before if', intersects.length)
    if (intersects.length > 0 && intersects[0].object.userData.URL) {
      console.log('inside if')
        const body = document.querySelector('body');
        body.style.cursor = 'pointer'
    }
  } 

let raycaster, mouse;
  
  function handleClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 -1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && intersects[0].object.userData.URL) {
        console.log('two', intersects[0])
        window.open(intersects[0].object.userData.URL);
    }
  } 

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
  const planeBottom = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: floorTexture })
  );
  planeBottom.rotateX(-Math.PI / 2);
  scene.add(planeBottom);

  const frontWallTexture = new THREE.TextureLoader().load(rightWall);
  const planeFront = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: frontWallTexture })
  );
  planeFront.position.z = 50;
  planeFront.position.y = 50;
  planeFront.rotateY(Math.PI);
  scene.add(planeFront);

  const backWallTexture = new THREE.TextureLoader().load(wall);
  const planeBack = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map:  backWallTexture})

  );
  planeBack.position.z = -50;
  planeBack.position.y = 50;
  //planeBack.rotateY( Math.PI );
  //planeBack.userData = { URL: "https://duckduckgo.com/"};
  scene.add(planeBack);

  const pictureGeo = new THREE.PlaneGeometry(48, 62);
  const pictureTexture = new THREE.TextureLoader().load(forgetMonkeys);
  const planePicture = new THREE.Mesh(
    pictureGeo,
    new THREE.MeshPhongMaterial({ map:  pictureTexture})

  );
  planePicture.position.z = -49;
  planePicture.position.y = 50;
  //planeBack.rotateY( Math.PI );
  planePicture.userData = { URL: "https://duckduckgo.com/"};
  scene.add(planePicture);


  const rightWallTexture = new THREE.TextureLoader().load(rightWall);
  const planeRight = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: rightWallTexture })
  );
  planeRight.position.x = 50;
  planeRight.position.y = 50;
  planeRight.rotateY(-Math.PI / 2);
  scene.add(planeRight);

  const leftWallTexture = new THREE.TextureLoader().load(leftWall);
  const planeLeft = new THREE.Mesh(
    planeGeo,
    new THREE.MeshPhongMaterial({ map: leftWallTexture })
  );
  planeLeft.position.x = -50;
  planeLeft.position.y = 50;
  planeLeft.rotateY(Math.PI / 2);
  scene.add(planeLeft);

  // lights
  const mainLight = new THREE.PointLight(0xcccccc, 1.5, 250);
  mainLight.position.y = 12;
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

  window.addEventListener("resize", onWindowResize);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener("click", handleClick);
  window.addEventListener("mouseover", handleHover); //does not work
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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
