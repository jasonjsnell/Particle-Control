import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const SPRITE_TOTAL = 1000;
const SPRITE_SIZE = 7;
let cloudPoints;
let cloudRadius = 3;
let newCloudRadius = 100;
const BRIGHT_DEFAULT = 2.69;
const GLOW_DEFAULT = 0.79;
const TRAIL_DEFAULT = 0.54

let composer;
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    2,
    2000
);
const clock = new THREE.Clock();
let afterImagePass, bloomPass;


//remember to move camera otherwise I might be in an object and not see it
camera.position.z = 300;

//all variables above functions
init3dCloud();

function init3dCloud() {

    //full screen
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    addObjects();
    animate();//starts render loop
}

function addObjects() {

    //store all the x y z points of every sprite in the cloud
    let vertices = [];

    //1000 sprites x 3 vertices (x, y, z) per points = 3000 positions
    for (let i = 0; i < SPRITE_TOTAL; i++) {
        //get randomized position for each sprite
        var vertex = _randomPointInSphere(cloudRadius);
        vertices.push(vertex.x, vertex.y, vertex.z);
    }

    //geo is a sphere sahpe
    const geometry = new THREE.SphereGeometry();

    //set position of vectices / sprites inside the cloud, using the array of randomized sprite positions above
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    //each sprite is a circular disc PNG
    const sprite = new THREE.TextureLoader().load('./assets/disc_128x128.png');
    const material = new THREE.PointsMaterial({
        size: SPRITE_SIZE,
        sizeAttenuation: true,
        map: sprite,
        alphaTest: 0.1,
        transparent: true,
        blending: THREE.AdditiveBlending //blend mode like photoshop, additive makes it brighter when it overlaps
    });

    //create cloud of points and pass into scene
    cloudPoints = new THREE.Points(geometry, material);
    scene.add(cloudPoints);

    //post processing effects
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    //trails effect
    afterImagePass = new AfterimagePass();
    afterImagePass.uniforms['damp'] = { value: TRAIL_DEFAULT };
	composer.addPass( afterImagePass );

    //glow effect
    bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.strength = BRIGHT_DEFAULT;
    bloomPass.radius = GLOW_DEFAULT;
    composer.addPass( bloomPass );

}

//draw loop
function animate() {

    requestAnimationFrame(animate);//calls self, becomes draw loop
    
    composer.render(); //post processing
   
    //spinning
    //let time = clock.getElapsedTime();

    //slowly rotate points
    cloudPoints.rotation.x -= 0.00025;
    cloudPoints.rotation.y += 0.0001;
    cloudPoints.rotation.z += 0.00021;
    
    //get every position in the geometry
    const positions = cloudPoints.geometry.attributes.position.array;

    //if a change is detected
    if (newCloudRadius != cloudRadius) {

        for (let i = 0; i < (SPRITE_TOTAL * 3); i++) {

            //get position
            let position = positions[i];
            
            //remove curr radius
            position /= cloudRadius
    
            //add in new radius
            position *= newCloudRadius

            //increase x rotation of sphere during zoom in / out
            //cloudPoints.rotation.x -= THREE.MathUtils.randFloat(-0.0001, 0.0001);

            //generate random movement
            //let randMovement = THREE.MathUtils.randFloat(-0.01, 0.01);
            //position += randMovement
    
            //put new value back into the array
            positions[i] = position
        }
    
        //save next radius for next loop
        cloudRadius = newCloudRadius
    
        //set to true to update screen
        cloudPoints.geometry.attributes.position.needsUpdate = true
    
    }
    
    
}

//access to change cloud radius
function updateRadius(newRadius){
    
    newCloudRadius = newRadius;

    //let newBrightness = map(newRadius, 5, 100, BRIGHT_DEFAULT, BRIGHT_DEFAULT);
    let newGlow = map(newRadius, 5, 100, GLOW_DEFAULT, 0);
    //updateBrightness(newBrightness)
    updateGlow(newGlow)
}
//make it accessible to the global scope so non-modules can access it
window.updateCloudRadius = updateRadius;

//access to change effects
export function updateTrails(newValue){
    afterImagePass.uniforms['damp'] = { value: newValue };
}
export function updateGlow(newValue){
    bloomPass.radius = newValue;
}
export function updateBrightness(newValue){
    bloomPass.strength = newValue;
}


//generates a random x y z for sprite in cloud
function _randomPointInSphere(radius) {

    //randomize x y z positions between -1 and 1
    const x = THREE.MathUtils.randFloat(-1, 1);
    const y = THREE.MathUtils.randFloat(-1, 1);
    const z = THREE.MathUtils.randFloat(-1, 1);
    const normalizationFactor = 1 / Math.sqrt(x * x + y * y);

    //create x y z vector
    let sphereVector = new THREE.Vector3();

    //normalize and more randomization
    sphereVector.x = x * normalizationFactor * THREE.MathUtils.randFloat(0, 2.0) * radius;
    sphereVector.y = y * normalizationFactor * THREE.MathUtils.randFloat(0, 2.0) * radius;
    sphereVector.z = z * normalizationFactor * THREE.MathUtils.randFloat(0, 1.1) * radius;

    //keep values within the a range
    let limit = 5.5;
    
    if (sphereVector.x > limit) {
        sphereVector.x = limit;
    }
    if (sphereVector.x < -limit) {
        sphereVector.x = -limit;
    }
    if (sphereVector.y > limit) {
        sphereVector.y = limit;
    }
    if (sphereVector.y < -limit) {
        sphereVector.y = -limit;
    }
    if (sphereVector.z > limit) {
        sphereVector.z = limit;
    }
    if (sphereVector.z < -limit) {
        sphereVector.z = -limit;
    }

    //return vector for this sprite
    return sphereVector;
}