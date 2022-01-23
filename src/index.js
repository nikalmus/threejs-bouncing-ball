import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 50);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = "canvas";
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

function addLighting(scene) {
  let color = 0xffffff;
  let intensity = 1;
  let light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, -2, -5);
  scene.add(light);
  scene.add(light.target);
}
addLighting(scene);

function addFloor(scene) {
  let geometry = new THREE.BoxGeometry(50, 1, 50);
  let material = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0,
  });
  const floor = new THREE.Mesh(geometry, material);
  floor.position.set(0, -10, 0);
  floor.name = "my-floor";
  scene.add(floor);
}
addFloor(scene);

function addSphere(scene) {
  let geometry = new THREE.SphereGeometry(5, 32, 32);
  let material = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    roughness: 0,
  });
  let sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 5, 0);
  sphere.name = "my-sphere";
  scene.add(sphere);
}
addSphere(scene);

let acceleration = 10; //9.8;
let bounceDistance = 9; //initial y=5, bottom y=-4
let bottomPositionY = -4;
let timeIncrement = 0.02;

//fall time is derived from formula that defines distance: d = 0.5 * g * t*t
let fallTime = Math.sqrt(bounceDistance / (0.5 * acceleration));
let initialSpeed = acceleration * fallTime;
let sphere = scene.getObjectByName("my-sphere");

const animate = () => {
  requestAnimationFrame(animate);
  // reset fallTime back to the start of the bouncing sequence when sphere hits through the bottom position
  if (sphere.position.y < bottomPositionY) {
    fallTime = 0;
  }
  // calculate sphere position with the s2 = s1 + ut + (1/2)gt*t formula
  // this formula assumes the ball to be bouncing off from the bottom position when fallTime is zero
  sphere.position.y =
    bottomPositionY +
    initialSpeed * fallTime -
    0.5 * acceleration * fallTime * fallTime;
  // advance time
  fallTime += timeIncrement;
  renderer.render(scene, camera);
};
animate();
