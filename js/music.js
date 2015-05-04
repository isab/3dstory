

(function(){
	console.clear();
  
  /**
    * THREE.js Object for having spheres of sound
    * Assumes the audio given to it is browser tested
    * 	i.e. the right filetype provided
    *
    * 	ARGUMENTS:
    *
    * 	options ( Object )
    *	 KEYS:
    *
    *	*	options.reciever (THREE.Object3D)
    *			the object that will detect the sound
    *
    *	*	options.source (THREE.Object3D)
    *			the object that will emit the sound
    *
    *	*	options.radius (Number)
    *		The sound radius. Default is 50.
    *
    *	*	options.url (String)
    *			Path to an audio file to load.
    *
    *	*	options.sound (HTMLAudioElement)
    *			An already-loaded audio file.
  **/
  
  THREE.Audio3D = function (options) {

    THREE.Object3D.call( this );
    
    if (!options) return this;
    
    this.reciever = options.reciever;
    this.soundRadius = options.radius || 50;
    this.onload = options.onload || new Function();
    this.loaded = false;
    
    if (options.url !== undefined) {
      // immediately begin to load if a sound path is attached
      if (typeof options.url === "string") this.load(options.url, this.onload);
      
      // if an audio element is passed in, assume it has been loaded already
      if ((options.sound || {}).toString() === "[object HTMLAudioElement]") this.init( options.sound );
    } 
    
    // attach to an object
    if (options.source) source.add( this );
    
    return this;
  };
	
  
  THREE.Audio3D.prototype = Object.create( THREE.Object3D.prototype );
  
  //Since THREE.js doesn't dispatch any events for matrix updates,
  //I hooked the THREE.Audio3D.update() method into the THREE.Object3D matrixUpdate()
  THREE.Audio3D.prototype.__updateMatrix = THREE.Audio3D.prototype.updateMatrix;
  THREE.Audio3D.prototype.updateMatrix = function(){
    this.update();
    this.__updateMatrix();
  };
  
  
  // The method used to calculate the distance between two objects.
  THREE.Audio3D.prototype.distanceTo = function(reciever, parent) {
    
    if (!reciever || !reciever.position || !parent || !parent.position) return 0;
    
    var p1 = reciever.position,
        p2 = parent.position;
    
    this.position = p1;
    return p1.distanceTo( p2 );
    
  };
  
  
  // Calculates the volume level.
  // Is called after the 'parent', or 'reciever', object's matrix is updated
  THREE.Audio3D.prototype.update = function(){
    
    if (!this.loaded || this.parent === undefined) return;

    var modifier = Math.abs( this.distanceTo(this.reciever, this.parent) );
    var radius = this.soundRadius;
    if ( modifier > radius){
      this.sound.volume = 0;
      return;
    }                 

    // keep volume within the range of 0 and 1
    this.sound.volume =  Math.min(1,Math.max(0,  1 - (modifier / radius) )); 
  };
  
  
  // Extension of the audio element's 'play' method
  THREE.Audio3D.prototype.play = function(){
    if (!this.loaded) return;
    this.update();
    this.sound.play();
  };
  
  
  // Extension of the audio element's 'pause' method
  THREE.Audio3D.prototype.pause = function(){
    if (!this.loaded) return;
    this.sound.pause();
  };
  

  
	// Initializes a loaded sound file. should be an HTMLAudioElement
  THREE.Audio3D.prototype.init = function(sound){
        this.loaded = true;
        this.sound = sound;
  };
  
  // onload can be overwritten to do whatever,
  // or, actions can be added using THREE.js's eventemitter ie
  // |   Audio3D.addEVentListener("loaded", callback)
  THREE.Audio3D.prototype.onload = function(){};
  
  // Loads an audio file, then calls THREE.Audio3D.init() on the sound
  THREE.Audio3D.prototype.load = function(path, callback){
    
    var that = this, 
        checkReadyState,
        load;
    
    this.addEventListener("loaded", callback);

    checkReadyState = function(sound, intervalId){
      if (sound.readyState === 4) {
        window.clearInterval(intervalId);
			 this.init(sound);
        this.dispatchEvent({"type":"loaded"});
      }
    };
    	
     load = function(path){
		 
      var sound = new Audio( path );
      sound.load();
      
       // no built-in events for audio loads, so periodically check
      var id = window.setInterval((function(){
         checkReadyState.call(that, sound, id);
      }), 50);
       
    };

    load( path );

  };
  
})();




/**
  *	Test it out
**/

$(document).ready((function(){
  
  // From http://blog.sklambert.com/html5-canvas-game-html5-audio-and-finishing-touches/
  var source = "http://blog.sklambert.com/wp-content/uploads/2012/09/sounds/kick_shock.mp3",
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
      renderer = new THREE.WebGLRenderer(),
      cube,
      cube2,
      playWhenLoaded,
      song,
      line;
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // The cube we want to be the observer of the 3d sound 
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(5,10,5),
    new THREE.MeshBasicMaterial( { color: 0xff2244, wireframe: true }
	) );
  
  //  The cube that will be emitting the sound
	cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(10,10,10),
    new THREE.MeshBasicMaterial( { color: 0x00cc99, wireframe: true }
	) );
  

  
  cube.position.z = -100;
  cube.position.y = -100;
  
  playWhenLoaded = function(){
    this.loop = true;
    this.play();
    console.log(this);
  };
  
  song = new THREE.Audio3D({"url":source, "reciever": cube2, "onload": playWhenLoaded});
  cube.add(song); 

  
  cube2.position = new THREE.Vector3(10, 0, -100);

  scene.add( cube );
  scene.add( cube2 );
  

  function render() {
    
    var material, radius, geometry;
    
    radius = parseInt( document.getElementById("sound-radius").value, 10 );
    
    song.soundRadius = radius;
    
    // re-draw the circle, remove the old
    if (line) scene.remove(line); // probably not optimised, at all
    
    material = new THREE.LineBasicMaterial( { color: 0xffffff } );
    geometry = new THREE.CircleGeometry( radius, 64 );
    geometry.vertices.shift(); // Remove center vertex
    line = new THREE.Line( geometry, material );
    line.position = cube2.position;
    scene.add( line );
    
    cube.position.y += parseFloat( document.getElementById("cube-speed").value, 10 );
    cube2.rotation.z += 0.0025;
    if (cube.position.y >= 90) cube.position.y = -100;
    

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  render();
  
  var on = true;
  
  $("canvas").click((function(e){
    
    e.preventDefault();
    if (on) {
      song.pause();
      on = !on;
      
    }
    else {
      song.play();
      on = !on;
    }
    document.getElementById("is-playing").innerHTML = on ? "yes" : "no";
  }));
  
  // check if the browser can play mp3 files
  var soundTest = document.createElement("audio");
  soundTest = soundTest.canPlayType("audio/mp4");
  if ( soundTest === "probably" || soundTest === "maybe" ) document.getElementById("can-play").innerText = "yes";
  else document.getElementById("can-play").innerText = "no"
  
}));