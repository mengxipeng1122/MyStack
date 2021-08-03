import './style.css'

import * as THREE from 'three'
import * as Ammo  from 'ammo.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


function initScene(scene)
{
    if (true)
    {
        scene.background = new THREE.Color(0x000000);
    }
    else
    {
        const  urls = [
            './assets/skybox/dawnclouds/px.jpg',
            './assets/skybox/dawnclouds/nx.jpg',
            './assets/skybox/dawnclouds/py.jpg',
            './assets/skybox/dawnclouds/ny.jpg',
            './assets/skybox/dawnclouds/pz.jpg',
            './assets/skybox/dawnclouds/nz.jpg',
        ];
        scene.background = new THREE.CubeTextureLoader().load( urls );
    }
}

function addPlane(scene, world)
{
    const planeGeometry = new THREE.BoxGeometry(25,  .5, 25 )
    const phongMaterial = new THREE.MeshPhongMaterial()
    const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial)
    planeMesh.receiveShadow = true
    scene.add(planeMesh)

//    const planeShape = new CANNON.Plane()
//    const planeBody = new CANNON.Body({ mass: 0 })
//    planeBody.addShape(planeShape)
//    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
//    world.addBody(planeBody)

}

function addSphere(scene, world) 
{
    const normalMaterial = new THREE.MeshNormalMaterial()
    const sphereGeometry = new THREE.SphereGeometry()
    const sphereMesh = new THREE.Mesh(sphereGeometry, normalMaterial)
    sphereMesh.position.x = -1
    sphereMesh.position.y = 5
    sphereMesh.position.z = 0
    sphereMesh.castShadow = true
    scene.add(sphereMesh)

//    const sphereShape = new CANNON.Sphere(1)
//    const sphereBody = new CANNON.Body({ mass: .01 })
//    sphereBody.addShape(sphereShape)
//    sphereBody.position.x = sphereMesh.position.x
//    sphereBody.position.y = sphereMesh.position.y
//    sphereBody.position.z = sphereMesh.position.z
//    world.addBody(sphereBody)
//    return {sphereMesh, sphereBody}
}


function addLights(scene)
{
//    const light1 = new THREE.SpotLight()
//    light1.position.set(2.5, 5, 5)
//    light1.angle = Math.PI / 4
//    light1.penumbra = 0.5
//    light1.castShadow = true
//    light1.shadow.mapSize.width = 1024
//    light1.shadow.mapSize.height = 1024
//    light1.shadow.camera.near = 0.5
//    light1.shadow.camera.far = 20
//    scene.add(light1)
//    
//    const light2 = new THREE.SpotLight()
//    light2.position.set(-2.5, 5, 5)
//    light2.angle = Math.PI / 4
//    light2.penumbra = 0.5
//    light2.castShadow = true
//    light2.shadow.mapSize.width = 1024
//    light2.shadow.mapSize.height = 1024
//    light2.shadow.camera.near = 0.5
//    light2.shadow.camera.far = 20
//    scene.add(light2)
    {
        const light = new THREE.AmbientLight({color:0x55ffbb})
        scene.add(light);
    }
}


function addBoxMesh(scene, world)
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

let rigidBodies = [], tmpTrans;

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
initScene(scene);


//Ammojs Initialization
let physicsWorld;

function setupPhysicsWorld()
{
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
    tmpTrans  = new Ammo.btTransform();
}

setupPhysicsWorld();


function createBlock(){

    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 50, y: 2, z: 50};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body );
}


function createBall(){

    let pos = {x: 0, y: 20, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body );

    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}


function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}


createBlock();
createBall();
// addBoxMesh(scene, world);
//addPlane(scene, physicsWorld)


//addSphere(scene, physicsWorld)

addLights(scene)

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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.2, 5000)
camera.position.x = 0;
camera.position.y = 30;
camera.position.z = 70;
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

    //const elapsedTime = clock.getElapsedTime()
    const elapsedTime = clock.getDelta();

    updatePhysics(elapsedTime);

    // controls.movementSpeed = 0.033 * elapsedTime;
    // Update Orbital Controls
    controls.update(elapsedTime)
    //world.step(1/60., elapsedTime, 3);
    //world.step(elapsedTime);

    //console.log(sphereBody.position)

    // sphereMesh.position.set(
    //     sphereBody.position.x,
    //     sphereBody.position.y,
    //     sphereBody.position.z);

    // sphereMesh.quaternion.set(
    //     sphereBody.quaternion.x,
    //     sphereBody.quaternion.y,
    //     sphereBody.quaternion.z,
    //     sphereBody.quaternion.w
    // )

    // Render
    renderer.render(scene, camera)


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
