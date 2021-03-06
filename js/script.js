var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var doit = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  controls: null,
  clock: null,
  stats: null,

  init: function() { // Initialization

    // create main scene
    this.scene = new THREE.Scene();

    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;

    // prepare camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 2000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 100, 300);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // prepare renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(0xffffff);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;

    // prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // events
    THREEx.WindowResize(this.renderer, this.camera);

    // prepare controls (OrbitControls)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 4000;

    // prepare clock
    this.clock = new THREE.Clock();

    // prepare stats
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '50px';
    this.stats.domElement.style.bottom = '50px';
    this.stats.domElement.style.zIndex = 1;
    this.container.appendChild( this.stats.domElement );

    // add spot light
    var spLight = new THREE.SpotLight(0xffffff, 1.75, 2000, Math.PI / 3);
    spLight.castShadow = true;
    spLight.position.set(-100, 300, -50);
    this.scene.add(spLight);

    // load a model
    this.loadModel();
    // add 3D text
    this.draw3dText( -100, 20, 0, 'StoryBook');
    this.drawSimpleSkybox();
  },
  
  loadModel: function() {

    // prepare loader and load the model
    var oLoader = new THREE.OBJMTLLoader();
    oLoader.load('obj/books.obj', 'obj/books.mtl', function(object) {
     
    object.position.x = 0;
    object.position.y = -50;
    object.position.z = 0;
    object.scale.set(1, 1, 1);
    doit.scene.add(object);
    });
  },

  drawSimpleSkybox: function() {

   var prefix = 'sky/';
   var cubeSides = [ prefix + 'sbox_px.jpg', prefix + 'sbox_nx.jpg',
    prefix + 'sbox_py.jpg', prefix + 'sbox_ny.jpg', 
    prefix + 'sbox_pz.jpg', prefix + 'sbox_nz.jpg' ];

     // load images onto cube
     var scene = THREE.ImageUtils.loadTextureCube(cubeSides);
     scene.format = THREE.RGBFormat;

      // prepare the shader to render the skybox
      var shader = THREE.ShaderLib["cube"];
      shader.uniforms["tCube"].value = scene;
      var material = new THREE.ShaderMaterial( {
       fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader,
       uniforms: shader.uniforms, depthWrite: false, side: THREE.BackSide
     });

      // create Mesh with cube geometry and add to the scene
      var skyBox = new THREE.Mesh(new THREE.CubeGeometry(500, 500, 500), material);
      material.needsUpdate = true;

      this.scene.add(skyBox);
    },

  draw3dText: function(x, y, z, text) {

      var theText = "3D StoryBook!";

        var hash = document.location.hash.substr( 1 );

        if ( hash.length !== 0 ) {

          theText = hash;

        }

        var text3d = new THREE.TextGeometry( theText, {

          size: 45,
          height: 20,
          curveSegments: 2,
          font: "helvetiker"

        });

        text3d.computeBoundingBox();
        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

        var textMaterial = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, overdraw: 0.5 } );
        text = new THREE.Mesh( text3d, textMaterial );

        text.position.x = centerOffset;
        text.position.y = 100;
        text.position.z = 0;

        text.rotation.x = 0;
        text.rotation.y = Math.PI * 2;

        group = new THREE.Group();
        group.add( text );

        doit.scene.add( group );

        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  }
};

function onDocumentMouseDown( event ) {

        event.preventDefault();

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener( 'mouseout', onDocumentMouseOut, false );

        mouseXOnMouseDown = event.clientX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

function onDocumentMouseUp( event ) {

  document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {

  document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

  if ( event.touches.length == 1 ) {

    event.preventDefault();

    mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

  }

}

function onDocumentTouchMove( event ) {

  if ( event.touches.length == 1 ) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

  }

}

function animate() {

  requestAnimationFrame( animate );

  THREE.AnimationHandler.update( doit.clock.getDelta() );

  doit.controls.update();

  render();
  doit.stats.update();

}

function render() {
  group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

  doit.renderer.render( doit.scene, doit.camera );

}

// Initialize lesson on page load
function initializeLesson() {
  doit.init();
  animate();
}

if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
