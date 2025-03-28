import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath("/textures/cubeMap/");

const sunTexture = textureLoader.load("./textures/2k_sun.jpg");
const mercuryTexture = textureLoader.load("./textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("./textures/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("./textures/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("./textures/2k_mars.jpg");
const moonTexture = textureLoader.load("./textures/2k_moon.jpg");
const jupiterTexture = textureLoader.load("./textures/2k_jupiter.jpg");
const uranusTexture = textureLoader.load("./textures/2k_uranus.jpg");

// cube map
cubeTextureLoader.setPath("./textures/cubeMap/");
const backgroundCubemap = cubeTextureLoader.load([
  "px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png",
]);
scene.background = backgroundCubemap;

const createMaterial = (texture) => new THREE.MeshStandardMaterial({ map: texture });

const materials = {
  sun: new THREE.MeshBasicMaterial({ map: sunTexture }),
  mercury: createMaterial(mercuryTexture),
  venus: createMaterial(venusTexture),
  earth: createMaterial(earthTexture),
  mars: createMaterial(marsTexture),
  moon: createMaterial(moonTexture),
  jupiter: createMaterial(jupiterTexture),
  uranus: createMaterial(uranusTexture),
};

// Sun
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sun = new THREE.Mesh(sphereGeometry, materials.sun);
sun.scale.setScalar(6);
scene.add(sun);

// Define planet
const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.01,
    material: materials.mercury,
    moons: []
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: materials.venus,
    moons: []
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: materials.earth,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.015
      }
    ]
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: materials.mars,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.02
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.015
      }
    ]
  },
  {
    name: "Jupiter",
    radius: 1.7,
    distance: 55,
    speed: 0.01,
    material: materials.jupiter,
    moons: []
  },
  {
    name: "Uranus",
    radius: 1.2,
    distance: 75,
    speed: 0.012,
    material: materials.uranus,
    moons: []
  }
];

const createSphere = (radius, material) => {
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.scale.setScalar(radius);
  return mesh;
};

// planets and add moons 
const planetMeshes = planets.map((planet) => {
  const planetMesh = createSphere(planet.radius, planet.material);
  planetMesh.position.x = planet.distance;
  scene.add(planetMesh);
  planet.moons.forEach((moon) => {
    const moonMesh = createSphere(moon.radius, materials.moon);
    moonMesh.userData = { distance: moon.distance, speed: moon.speed, angle: 0 };
    planetMesh.add(moonMesh);
  });
  return planetMesh;
});

//lighting the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1.7);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Set up camera
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 5, 75);

const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 10;

// Toggle animation button
let animationRunning = true;
const toggleAnimation = () => {
  animationRunning = !animationRunning;
};

const button = document.createElement("button");
button.textContent = "Toggle Motion";
button.style.position = "absolute";
button.style.top = "10px";
button.style.right = "10px";
button.style.padding = "10px";
button.style.backgroundColor = "black";
button.style.color = "white";
document.body.appendChild(button);
button.addEventListener("click", toggleAnimation);

// window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const renderLoop = () => {
  if (animationRunning) {
    planetMeshes.forEach((planet, index) => {
      planet.rotation.y += planets[index].speed;
      planet.position.x = Math.sin(planet.rotation.y) * planets[index].distance;
      planet.position.z = Math.cos(planet.rotation.y) * planets[index].distance;
      
      // Update moons
      planet.children.forEach((moon) => {
        moon.userData.angle += moon.userData.speed;
        moon.position.x = Math.sin(moon.userData.angle) * moon.userData.distance;
        moon.position.z = Math.cos(moon.userData.angle) * moon.userData.distance;
      });
    });
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
};
renderLoop();
