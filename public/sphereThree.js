const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    2,
    2000
);

let spherePoints;
let sphereVector;

//all variables above functions
init3dSphere();

function init3dSphere(){

    //init global vars
    sphereVector = new THREE.Vector3();

    //remember to move camera otherwise I might be in an object and not see it
    camera.position.z = 300;

    //full screen
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    addLights();
    addObjects();
    animate(); //starts render loop
}

//draw loop
function animate(){
    requestAnimationFrame(animate);//calls self, becomes draw loop
    renderer.render(scene, camera)
    spherePoints.rotation.x += 0.01;
    spherePoints.rotation.y += 0.01;
}

function randomPointInSphere( radius ) {
    
    const x = THREE.MathUtils.randFloat( -1, 1 );
    const y = THREE.MathUtils.randFloat( -1, 1 );
    const z = THREE.MathUtils.randFloat( -1, 1 );
    const normalizationFactor = 1 / Math.sqrt( x * x + y * y );
  
    sphereVector.x = x * normalizationFactor * THREE.MathUtils.randFloat( 0.1 * radius, 2.0 * radius );
    sphereVector.y = y * normalizationFactor *  THREE.MathUtils.randFloat( 0.1 * radius, 2.0 * radius );
    sphereVector.z = z * normalizationFactor * THREE.MathUtils.randFloat( 0.1 * radius, 1.1 * radius );
  
    return sphereVector;
  }

  function addObjects(){

    scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

    const vertices = [];

    for ( let i = 0; i < 1000; i ++ ) {

        var vertex = randomPointInSphere( 50 );
        vertices.push( vertex.x, vertex.y, vertex.z );
        // const x = THREE.MathUtils.randFloatSpread( 50 );
        // const y = THREE.MathUtils.randFloatSpread( 50 );
        // const z = THREE.MathUtils.randFloatSpread( 100 );

        // vertices.push( x, y, z );

    }

    //const geometry = new THREE.BufferGeometry();
    const geometry = new THREE.SphereGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const sprite = new THREE.TextureLoader().load( './assets/disc.png' );
    //const material = new THREE.PointsMaterial( { color: 0xFF0000 } );
    const material = new THREE.PointsMaterial( { size: 5, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true } );
				
    spherePoints = new THREE.Points( geometry, material );

    scene.add( spherePoints );
}

function addLights(){
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.3);
    const pointLight = new THREE.PointLight(0xFFFFFF, 1, 50);
    pointLight.position.set(0, 2, 1);
    scene.add(ambient);
    scene.add(pointLight);
}