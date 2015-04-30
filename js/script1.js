// load  
var texture = THREE.ImageUtils.loadTexture('texture.png');
texture.repeat.set(0.03, 0.03);
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.anisotropy = 16;
texture.needsUpdate = true;

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
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 2000, FAR = 4000;
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
    // var ground = new THREE.Mesh( new THREE.PlaneGeometry(500, 500, 10, 10), new THREE.MeshLambertMaterial({color:0x999999}) );
    // ground.receiveShadow = true;
    // ground.position.set(0, 0, 0);
    // ground.rotation.x = -Math.PI / 2;
    // this.scene.add(ground);

    // load a model
    this.loadModel();
    // add 3D text
    this.draw3dText( 0, 500, 0, 'StoryBook');
  },
  loadModel: function() {

    // prepare loader and load the model
    var oLoader = new THREE.OBJLoader();
    oLoader.load('obj/Book2.obj', function(object, materials) {

      // var material = new THREE.MeshFaceMaterial(materials);
      var material2 = new THREE.MeshLambertMaterial({ color: 0xa65e00 });

      object.traverse( function(child) {
        if (child instanceof THREE.Mesh) {

          // apply custom material
          child.material = material2;
          child.material.color.setRGB(1,0,0);
          // enable casting shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      object.position.x = 0;
      object.position.y = 0;
      object.position.z = 0;
      //object.rotation.x = -Math.PI / 2;
      object.scale.set(30, 30, 30);
      lesson6.scene.add(object);
    });
  },

  draw3dText: function(x, y, z, text) {

      // prepare text geometry
      var textGeometry = new THREE.TextGeometry(text, {
          size: 150, // Font size
          height: 30, // Font height (depth)
          font: 'droid serif', // Font family
          weight: 'bold', // Font weight
          style: 'normal', // Font style
          curveSegments: 1, // Amount of curve segments
          bevelThickness: 5, // Bevel thickness
          bevelSize: 5, // Bevel size
          bevelEnabled: true, // Enable/Disable the bevel
          material: 0, // Main material
          extrudeMaterial: 1 // Side (extrude) material
      });

      // prepare two materials
      var materialFront = new THREE.MeshPhongMaterial({ map: texture, color: 0xffff00, emissive: 0x888888 });
      var materialSide = new THREE.MeshPhongMaterial({ map: texture, color: 0xff00ff, emissive: 0x444444 });

      // create mesh object
      var textMaterial = new THREE.MeshFaceMaterial([ materialFront, materialSide ]);
      var textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.castShadow = true;

      // place the mesh in the certain position, rotate it and add to the scene
      textMesh.position.set(x, y, z);
      textMesh.rotation.x = -0.3;
      this.scene.add(textMesh);
  }
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

// Update controls and stats
function update() {
  lesson6.controls.update(lesson6.clock.getDelta());
  lesson6.stats.update();
}

// Render the scene
function render() {
  if (lesson6.renderer) {
    lesson6.renderer.render(lesson6.scene, lesson6.camera);
  }
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
