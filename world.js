
            var container, stats;
 
            var camera, scene, renderer;
            var geometry, mesh, material;
            var controls;
 
            var objects = [];
 
            var amountOfParticles = 500000, maxDistance = Math.pow(120, 2);
            var positions, alphas, particles, _particleGeom;
 
            var clock = new THREE.Clock();
 
            var blocker = document.getElementById( 'blocker' );
            var instructions = document.getElementById( 'instructions' );

//
 		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        		if ( havePointerLock ) {
            		var element = document.body;
            		var pointerlockchange = function ( event ) {
                    		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
						controlsEnabled = true;
						controls.enabled = true;
						blocker.style.display = 'none';
					} else {
						controls.enabled = false;
						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';
						instructions.style.display = '';
					}
				};
				var pointerlockerror = function ( event ) {
					instructions.style.display = '';
				};
				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
				instructions.addEventListener( 'click', function ( event ) {
					instructions.style.display = 'none';
					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
					if ( /Firefox/i.test( navigator.userAgent ) ) {
						var fullscreenchange = function ( event ) {
							if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
								element.requestPointerLock();
							}
						};
						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
						element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
						element.requestFullscreen();
					} else {
						element.requestPointerLock();
					}
				}, false );
			} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			}
			init();
			animate();

                	var controlsEnabled = false;
			var moveForward = false;
			var moveBackward = false;
			var moveLeft = false;
			var moveRight = false;
			var canJump = false;
			var prevTime = performance.now();
			var velocity = new THREE.Vector3();           
 
 
            function init() {
                container = document.createElement( 'div' );
                document.body.appendChild( container );
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000000);
 
                scene = new THREE.Scene();
 
                controls = new THREE.FirstPersonControls( camera );
                controls.movementSpeed = 100;
                controls.lookSpeed = 0.1;
 
                var textureLoader = new THREE.TextureLoader();
 
                var materials = [
 
                    new THREE.MeshBasicMaterial( { map: textureLoader.load( 'textures/cube/skybox/px.jpg' ) } ), // right
                    new THREE.MeshBasicMaterial( { map: textureLoader.load( 'textures/cube/skybox/nx.jpg' ) } ), // left
                    new THREE.MeshBasicMaterial( { map: textureLoader.load( 'textures/cube/skybox/py.jpg' ) } ), // top
                    new THREE.MeshBasicMaterial( { map: textureLoader.load( 'textures/cube/skybox/ny.jpg' ) } ), // bottom
                    new THREE.MeshBasicMaterial( { map: textureLoader.load( 'textures/cube/skybox/pz.jpg' ) } ), // back
                    new THREE.MeshBasicMaterial( { map: textureLoader.load( 'textures/cube/skybox/nz.jpg' ) } )  // front
 
                ];
 
                mesh = new THREE.Mesh( new THREE.BoxGeometry( 10000, 10000, 10000, 7, 7, 7 ), new THREE.MultiMaterial( materials ) );
                mesh.scale.x = - 1;
                scene.add(mesh);
 
                //
 
                renderer = new THREE.WebGLRenderer(); // Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer()
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight );
                container.appendChild( renderer.domElement );
                stats = new Stats();
                container.appendChild( stats.dom );
 
                document.body.appendChild( renderer.domElement );
                // create the custom shade
                //var imagePreviewTexture = new THREE. TextureLoader();
 
                // load a resource
                //imagePreviewTexture.load(
                    // resource URL
                    //'textures/Dream.png',
                    // Function when resource is loaded
                    //function ( texture ) {
                        // do something with the texture
                        //var material = new THREE.MeshBasicMaterial( {
                            //map: texture
                         //} );
                    //},
                    // Function called when download progresses
                    //function ( xhr ) {
                        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                    //},
                    // Function called when download errors
                    //function ( xhr ) {
                        //console.log( 'An error happened' );
                    //}
                //);
 
 
 
                var imagePreviewTexture = textureLoader.load( 'textures/god.png');
                imagePreviewTexture.minFilter = THREE.LinearMipMapLinearFilter;
                imagePreviewTexture.magFilter = THREE.LinearFilter;
                imagePreviewTexture.anisotropy = 1;
                imagePreviewTexture.magFilter = THREE.NearestFilter;
                imagePreviewTexture.minFilter = THREE.NearestFilter;
 
 
 
                pointShaderMaterial = new THREE.ShaderMaterial( {
                    uniforms: {
                        tex1: { value: imagePreviewTexture },
                        zoom: { value: 9.0 },
                    },
                    vertexShader:   document.getElementById( 'vertexshader' ).textContent,
                    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                    transparent: true
                });
 
 
                //create particles with buffer geometry
                var distanceFunction = function(a, b){
                    return Math.pow(a[0] - b[0], 2) +  Math.pow(a[1] - b[1], 2) +  Math.pow(a[2] - b[2], 2);
                };
 
                positions = new Float32Array( amountOfParticles * 3 );
                alphas = new Float32Array( amountOfParticles );
 
                _particleGeom = new THREE.BufferGeometry();
                _particleGeom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
                _particleGeom.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
 
                particles = new THREE.Points( _particleGeom, pointShaderMaterial );
 
                for (var x = 0; x < amountOfParticles; x++) {
                    positions[ x * 3 + 0 ] = Math.random() * 1000;
                    positions[ x * 3 + 1 ] = Math.random() * 1000;
                    positions[ x * 3 + 2 ] = Math.random() * 1000;
                    alphas[x] = 1.0;
                }
 
 
                var measureStart = new Date().getTime();
 
                // creating the kdtree takes a lot of time to execute, in turn the nearest neighbour search will be much faster
                kdtree = new THREE.TypedArrayUtils.Kdtree( positions, distanceFunction, 3 );
 
                console.log('TIME building kdtree', new Date().getTime() - measureStart);
 
                // display particles after the kd-tree was generated and the sorting of the positions-array is done
                scene.add(particles);
 
                window.addEventListener( 'resize', onWindowResize, false );
 
 
 
            }
 
            function addStatsObject() {
                stats = new Stats();
                stats.setMode(0);
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.left = '0px';
                stats.domElement.style.top = '0px';
 
                document.body.appendChild( stats.domElement );
    }
 
 
            function onWindowResize() {
 
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
 
                renderer.setSize( window.innerWidth, window.innerHeight );
 
                controls.handleResize();
            }
 
            function animate() {
 
                requestAnimationFrame( animate );
 
                //
                displayNearest(camera.position);
 
                controls.update( clock.getDelta() );
 
                renderer.render( scene, camera);
                stats.update();
            }
 
            function displayNearest(position) {
 
                // take the nearest 200 around him. distance^2 'cause we use the manhattan distance and no square is applied in the distance function
                var imagePositionsInRange = kdtree.nearest([position.x, position.y, position.z], 100, maxDistance);
 
                // We combine the nearest neighbour with a view frustum. Doesn't make sense if we change the sprites not in our view... well maybe it does. Whatever you want.
                var _frustum = new THREE.Frustum();
                var _projScreenMatrix = new THREE.Matrix4();
                camera.matrixWorldInverse.getInverse( camera.matrixWorld );
 
                _projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
                _frustum.setFromMatrix( _projScreenMatrix );
 
                for ( i = 0, il = imagePositionsInRange.length; i < il; i ++ ) {
                    var object = imagePositionsInRange[i];
                    var objectPoint = new THREE.Vector3().fromArray( object[ 0 ].obj );
 
                    if (_frustum.containsPoint(objectPoint)){
 
                        var objectIndex = object[0].pos;
 
                        // set the alpha according to distance
                        alphas[ objectIndex ] = 1.0 / maxDistance * object[1];
                        // update the attribute
                        _particleGeom.attributes.alpha.needsUpdate = true;
                    }
                }
            }