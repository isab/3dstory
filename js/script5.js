var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var p1set = localStorage.getItem('P1Set');
p1set = JSON.parse(p1set);
var p1 = p1set.P1;

var song = localStorage.getItem('Song');
song = JSON.parse(song);
var s = song.Song;

//console.log(p1 + " " + set);

var lesson6 = {
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

    // add simple ground
    var ground = new THREE.Mesh( new THREE.PlaneGeometry(500, 500, 10, 10), new THREE.MeshLambertMaterial({color:0xffffff, transparent: true, opacity: 0.1}) );
    ground.receiveShadow = true;
    ground.position.set(0, -60, 0);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // load a model
    this.loadAnimation();
    this.playMusic();
    // add 3D text
    this.draw3dText( -100, 20, 0, 'StoryBook');
    this.drawSimpleSkybox();
  },

  loadAnimation: function() {
    var person;
    if(p1 === "Dan"){
      person = "obj/man.js";
    }
    else{
      person = "obj/woman.js";
    }
    var loader = new THREE.JSONLoader();

    loader.load( person, function ( geometry, materials ) {

          for ( var k in materials ) {

            materials[k].skinning = true;

            materials[k].color.setHSL( 0.6, 0, 0.6 );

          }

          skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
          skinnedMesh.position.set(-20,-60,-20);
          skinnedMesh.scale.set( 40, 40, 60 );
          skinnedMesh.castShadow = true;
          lesson6.scene.add( skinnedMesh );
          animation = new THREE.Animation( skinnedMesh, skinnedMesh.geometry.animations[ 0 ]);
          animation.play();

        });

  },

  drawSimpleSkybox: function() {
    var prefix, cubeSides;

      prefix = 'MarriottMadisonWest/';
      cubeSides = [ prefix + 'posx.jpg', prefix + 'negx.jpg',
        prefix + 'posy.jpg', prefix + 'negy.jpg', 
        prefix + 'posz.jpg', prefix + 'negz.jpg' ];

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

  playMusic: function() {
      var pick;

      if(s === "Taylor Swift"){
        pick = 'Style.mp3';
      }
      else{
        pick = 'jackson5.mp3';
      }

      var sound = new Howl({
        urls: [pick]
        }).play();
  },

  draw3dText: function(x, y, z, text) {

      var theText = p1 + " listened to " + s + " and went to bed.";

        var hash = document.location.hash.substr( 1 );

        if ( hash.length !== 0 ) {

          theText = hash;

        }

        var text3d = new THREE.TextGeometry( theText, {

          size: 15,
          height: 10,
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

        group.castShadow = true;

        lesson6.scene.add( group );

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

  THREE.AnimationHandler.update( lesson6.clock.getDelta() );

  lesson6.controls.update();

  render();
  lesson6.stats.update();

}

function render() {
  group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

  lesson6.renderer.render( lesson6.scene, lesson6.camera );

}

// Initialize lesson on page load
function initializeLesson() {
  lesson6.init();
  animate();
}

if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
