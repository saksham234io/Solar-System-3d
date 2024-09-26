import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();


const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath('/textures/cubeMap/')


const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");
const jupiterTexture = textureLoader.load("/textures/2k_jupiter.jpg");
const uranusTexture = textureLoader.load("/textures/2k_uranus.jpg");

const backgroundCubemap = cubeTextureLoader
  .load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png'
  ]);

scene.background = backgroundCubemap


const mercuryMaterial = new THREE.MeshStandardMaterial({
  map: mercuryTexture,
});
const venusMaterial = new THREE.MeshStandardMaterial({
  map: venusTexture,
});
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
});
const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
});
const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
});
const jupiterMaterial = new THREE.MeshStandardMaterial({
  map: jupiterTexture,
});
const uranusMaterial = new THREE.MeshStandardMaterial({
  map: uranusTexture,
});


const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
});

const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.setScalar(6);
scene.add(sun);

const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.01,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: earthMaterial,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.015,
      },
    ],
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.02,
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.015,
        color: 0xffffff,
      },
    ],
  },
  {
    name: "Jupiter",
    radius: 1.7,
    distance: 55,
    speed: 0.01,
    material: jupiterMaterial,
    moons: []
  },
  {
    name: "Uranus",
    radius: 1.2,
    distance: 75,
    speed: 0.012,
    material: uranusMaterial,
    moons: []
  }
];

const createPlanet = (planet) => {
  const planetMesh = new THREE.Mesh(
    sphereGeometry,
    planet.material
  )
  planetMesh.scale.setScalar(planet.radius)
  planetMesh.position.x = planet.distance
  return planetMesh
}

const createMoon = (moon) => {
  const moonMesh = new THREE.Mesh(
    sphereGeometry,
    moonMaterial
  )
  moonMesh.scale.setScalar(moon.radius)
  moonMesh.position.x = moon.distance
  return moonMesh
}


const planetMeshes = planets.map((planet) => {
  const planetMesh = createPlanet(planet)
  scene.add(planetMesh)

  planet.moons.forEach((moon) => {
    const moonMesh = createMoon(moon)
    planetMesh.add(moonMesh)
  })
  return planetMesh
})

console.log(planetMeshes)


const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.3
)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(
  0xffffff,
  1.7
)
scene.add(pointLight)

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.z = 75;
camera.position.y = 5;

const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


const renderloop = () => {
  planetMeshes.forEach((planet, planetIndex) => {
    planet.rotation.y += planets[planetIndex].speed
    planet.position.x = Math.sin(planet.rotation.y) * planets[planetIndex].distance
    planet.position.z = Math.cos(planet.rotation.y) * planets[planetIndex].distance
    planet.children.forEach((moon, moonIndex) => {
      moon.rotation.y += planets[planetIndex].moons[moonIndex].speed
      moon.position.x = Math.sin(moon.rotation.y) * planets[planetIndex].moons[moonIndex].distance
      moon.position.z = Math.cos(moon.rotation.y) * planets[planetIndex].moons[moonIndex].distance
    })
  })

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
