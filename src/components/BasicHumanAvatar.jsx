import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const InteractiveHumanAvatar = () => {
	const mountRef = useRef(null);
	const sceneRef = useRef(null);
	const cameraRef = useRef(null);
	const rendererRef = useRef(null);
	const avatarRef = useRef(null);
	const animationFrameRef = useRef(null);
	const mousePositionRef = useRef({ x: 0, y: 0 }); // Store mouse position

	const animate = useCallback(() => {
		if (avatarRef.current) {
			// Get hands
			const handIKLeft = avatarRef.current.getObjectByName("Hand_IKL");
			const lowerArmLeft = avatarRef.current.getObjectByName("LowerArmL");
			const upperArmTargetLeft = avatarRef.current.getObjectByName("UpperArmTarget.L");

			if (handIKLeft && lowerArmLeft) {
				// Normalize mouse position (-1 to 1 range for both x and y)
				const normalizedX =
					(mousePositionRef.current.x / window.innerWidth) * 2 - 1;
				console.log("x=" + normalizedX);
				const normalizedY =
					-(mousePositionRef.current.y / window.innerHeight) * 2 + 1;
				console.log("y=" + normalizedY);

				// Scaling the movement range for the IK targets
				const moveFactor = 2; // Adjust for sensitivity

				// Compute new positions for IK targets
				const handLeftTargetX = normalizedX * moveFactor;
				const handLeftTargetY = normalizedY * moveFactor;
				const handLeftTargetZ = Math.abs(normalizedY) * 0.1; // Add inward movement

				const maxRotation = Math.PI / 2; // 45 degrees

				// lowerArmLeft.rotation.x = normalizedY * maxRotation;
				lowerArmLeft.rotation.y = -normalizedX * maxRotation;

				// Move the IK targets
				handIKLeft.position.set(
					normalizedX + 1,
					normalizedY,
					handLeftTargetZ
				);
				lowerArmLeft.position.set(
					-normalizedY * -.2,
					normalizedX * 1,
					handLeftTargetZ
				);
			// handIKLeft.position.x = normalizedX;
			// handIKLeft.position.y = normalizedY;
			}
		}

		rendererRef.current.render(sceneRef.current, cameraRef.current);
		animationFrameRef.current = requestAnimationFrame(animate);
	}, []);

	useEffect(() => {
		const currentMount = mountRef.current;

		if (!currentMount) {
			console.error("Mount ref is null");
			return;
		}

		// Scene setup
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);
		sceneRef.current = scene;

		// Camera setup
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 1.6, 3);
		camera.lookAt(0, 1.6, 0);
		cameraRef.current = camera;

		// Renderer setup
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		currentMount.appendChild(renderer.domElement);
		rendererRef.current = renderer;

		// Lighting setup
		const ambientLight = new THREE.AmbientLight(0x404040, 2);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(1, 1, 1);
		scene.add(directionalLight);

		// Load avatar model
		const loader = new GLTFLoader();
		loader.load(
			"/sample.glb",
			(gltf) => {
				avatarRef.current = gltf.scene;
				scene.add(avatarRef.current);
				console.log("Avatar model loaded successfully");
			},
			(progress) =>
				console.log(
					`Loading model... ${(
						(progress.loaded / progress.total) *
						100
					).toFixed(2)}% complete`
				),
			(error) =>
				console.error("An error occurred loading the model:", error)
		);

		// Start animation loop
		animationFrameRef.current = requestAnimationFrame(animate);

		// Handle window resize
		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize(width, height);
		};
		window.addEventListener("resize", handleResize);

		// Handle mouse movement
		const handleMouseMove = (event) => {
			mousePositionRef.current = { x: event.clientX, y: event.clientY }; // Update ref for mouse position
		};
		window.addEventListener("mousemove", handleMouseMove);

		// Clean up
		return () => {
			if (currentMount) {
				currentMount.removeChild(renderer.domElement);
			}
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			cancelAnimationFrame(animationFrameRef.current);
		};
	}, [animate]);

	return (
		<div>
			<div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
		</div>
	);
};

export default InteractiveHumanAvatar;
