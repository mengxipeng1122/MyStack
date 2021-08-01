import './style.css'

import * as THREE from 'three'
import * as CANNON from 'cannon'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


function initScene(scene)
{
    //scene.background = new THREE.Color(0x000000);
    var urls = [
        './assets/skybox/dawnclouds/px.jpg',
        './assets/skybox/dawnclouds/nx.jpg',
        './assets/skybox/dawnclouds/py.jpg',
        './assets/skybox/dawnclouds/ny.jpg',
        './assets/skybox/dawnclouds/pz.jpg',
        './assets/skybox/dawnclouds/nz.jpg',
    ];
    var cube = new THREE.CubeTextureLoader().load( urls );
     // 
    scene.background = cube;
}

function addBoxMesh(scene)
{
    const geometry = new THREE.BoxGeometry(3,1,3);
    const material = new THREE.MeshLambertMaterial({color: 0xff8000});
    const mesh     = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function addCannon(scene)
{
    // Setup our world
    // Create a sphere
    var radius = 1; // m
    var sphereBody = new CANNON.Body({
       mass: 5, // kg
       position: new CANNON.Vec3(0, 0, 10), // m
       shape: new CANNON.Sphere(radius)
    });
    world.addBody(sphereBody);
    
    // Create a plane
    var groundBody = new CANNON.Body({
        mass: 0 // mass == 0 makes the body static
    });
}

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
initScene(scene);

// World
var world = new CANNON.World({
   gravity: new CANNON.Vec3(0, 0, -9.82) // m/s²
});
    


addBoxMesh(scene);

/**
 * Sizes
 */
const sizes = {
    width : innerWidth,
    height: innerHeight,
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

function eventHandler() {
}

window.addEventListener("mousedown", eventHandler);
window.addEventListener("touchstart", eventHandler);
window.addEventListener("keydown", function(event){
    if (event.key == ' ')
    {
        event.preventDefault();
        console.log(' space key just is pressed')
        return;
    }
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 10000)
camera.position.x = 0;
camera.position.y = 5;
camera.position.z = 8;
scene.add(camera)

// Controls
 const controls = new OrbitControls(camera, canvas); controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha : true,
    antialiasing : true,

})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // controls.movementSpeed = 0.033 * elapsedTime;
    // Update Orbital Controls
    controls.update(elapsedTime)

    // Render
    renderer.render(scene, camera)

    world.step(1/60., elapsedTime, 3);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
