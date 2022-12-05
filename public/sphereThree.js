import * as THREE from 'three';
    
const SPRITE_TOTAL = 1000;
const SPRITE_SIZE = 2;
let spherePoints;
let sphereRadius = 3;

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    2,
    2000
);
const clock = new THREE.Clock();

//remember to move camera otherwise I might be in an object and not see it
camera.position.z = 300;

//all variables above functions
init3dSphere();

function init3dSphere(){

    //full screen
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    addObjects();
    animate();//starts render loop
}

//draw loop
function animate(){
    
    requestAnimationFrame(animate);//calls self, becomes draw loop
    renderer.render(scene, camera)
 
    //spinning
    let time = clock.getElapsedTime();

    //slowly rotate points
    spherePoints.rotation.x -= 0.0005;
    spherePoints.rotation.y += 0.00125;
    spherePoints.rotation.z += 0.0033;
    //camera.position.z = 300 + (Math.sin(time * 0.9) * 10);

    let radiusChange = (Math.sin(time * 0.5) * 0.2);

    //get every position in the geometry
    const positions = spherePoints.geometry.attributes.position.array; 
    
    //calc curr and next radius
    let currRadius = sphereRadius
    let nextRadius = sphereRadius + radiusChange;

    for (let i = 0; i < (SPRITE_TOTAL * 3); i++) {

        //get position
        let position = positions[i];

        //remove curr radius
        position /= currRadius

        //add in next radius
        position *= nextRadius

        //put new value back into the array
        positions[i] = position
    }

    //save next radius for next loop
    sphereRadius = nextRadius

    //set to true to update screen
    spherePoints.geometry.attributes.position.needsUpdate = true
}


function addObjects(){

    let vertices = [];

    //1000 sprites x 3 vertices (x, y, z) per points = 3000 positions

    for ( let i = 0; i < SPRITE_TOTAL; i ++ ) {

        var vertex = _randomPointInSphere( sphereRadius ); 
        vertices.push( vertex.x, vertex.y, vertex.z );
    }

    //TODO: run limter code on vertices

    const geometry = new THREE.SphereGeometry();
    
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const sprite = new THREE.TextureLoader().load( './assets/disc.png' );
    const material = new THREE.PointsMaterial( { 
        size: SPRITE_SIZE, 
        sizeAttenuation: true, 
        map: sprite, 
        alphaTest: 0.4, 
        transparent: true,
        blending: THREE.AdditiveBlending //blend mode 
    } );
	
    
    spherePoints = new THREE.Points( geometry, material );

    scene.add( spherePoints );
}


function _randomPointInSphere( radius ) {
    
    const x = THREE.MathUtils.randFloat( -1, 1 );
    const y = THREE.MathUtils.randFloat( -1, 1 );
    const z = THREE.MathUtils.randFloat( -1, 1 );
    const normalizationFactor = 1 / Math.sqrt( x * x + y * y );
    
    let sphereVector = new THREE.Vector3();

    sphereVector.x = x * normalizationFactor * THREE.MathUtils.randFloat( 0, 2.0 ) * radius;
    sphereVector.y = y * normalizationFactor *  THREE.MathUtils.randFloat( 0, 2.0 ) * radius;
    sphereVector.z = z * normalizationFactor * THREE.MathUtils.randFloat( 0, 1.1 ) * radius;
  
    return sphereVector;
}