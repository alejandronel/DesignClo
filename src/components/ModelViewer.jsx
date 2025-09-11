import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import TWEEN from '@tweenjs/tween.js';

import { App } from 'antd';

import tauriFetch from '../utils/tauriFetch';

/**
 * @param {{
 * 	form: import('../pages/Create').Form;
 * 	dynamicReference: import('../pages/Canvas').DynamicReference;
 * 	setDynamicReference: React.Dispatch<React.SetStateAction<import('../pages/Canvas').DynamicReference>>;
 * 	cameraTo?: { position: { x: number, y: number, z: number }, animated?: boolean };
 * 	onInteract: (e: MouseEvent, interaction: ({ hits: THREE.Intersection[], raycaster: THREE.Raycaster, mouse: THREE.Vector2 })) => Void;
 * 	onClick?: (e: MouseEvent | TouchEvent) => Void;
 * 	setLoading?: React.Dispatch<React.SetStateAction<Boolean>>;
 * } & React.HTMLAttributes<HTMLDivElement>} props
 * @returns {React.JSX.IntrinsicElements.div}
 */
const ModelViewer = ({
	form,
	dynamicReference,
	setDynamicReference,
	cameraTo = { position: { x: 0, y: 2, z: 5 }, animated: false },
	onInteract,
	onClick,
	setLoading,
	...props
}) => {
	const mountReference = React.useRef();
	const url = 'http://52.221.81.246'; // material/ and model/
	const queries = `type=${form.garment}&sleeve=${form.sleeve}&collar=${form.collar}&design=${form.design}`;

	const tweenRef = React.useRef();

	const [mtlData, setMtlData] = React.useState(null);
	const [objData, setObjData] = React.useState(null);

	const notification = App.useApp().notification;

	React.useEffect(() => {
		tauriFetch(`${url}/material/?${queries}`)
			.then(response => response.text())
			.then(data => {
				setMtlData(data);
			})
			.catch(error => {
				console.error('Error fetching MTL data:', error);
				notification.error({
					message: 'Error',
					description: <pre>{error.message}</pre>,
					duration: 5,
					style: { padding: 16 },
					closeIcon: null
				});
			});
	}, []);
	React.useEffect(() => {
		tauriFetch(`${url}/model?${queries}`)
			.then(response => response.text())
			.then(data => {
				setObjData(data);
			})
			.catch(error => {
				console.error('Error fetching OBJ data:', error);
				notification.error({
					message: 'Error',
					description: <pre>{error.message}</pre>,
					style: { padding: 16 },
					closeIcon: null
				});
			});
	}, []);

	React.useEffect(() => {
		if (!mountReference.current || !mtlData || !objData) return;

		const width = mountReference.current.clientWidth;
		const height = mountReference.current.clientHeight;

		// Scene setup
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0, 2, 5);
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(width, height);
		mountReference.current.appendChild(renderer.domElement);
		setDynamicReference(prev => ({
			...prev,
			camera,
			renderer,
			scene
		}));

		// Set up camera position and controls
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.enablePan = false;
		controls.enableZoom = true;
		controls.minPolarAngle = Math.PI * 0.25;
		controls.maxPolarAngle = Math.PI * 0.75;
		// Add lighting
		scene.add(new THREE.AmbientLight(0xffffff, 0.75));
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(5, 10, 5);
		scene.add(directionalLight);
		setDynamicReference(prev => ({
			...prev,
			controller: controls
		}));

		camera.onBeforeRender = () => {
			directionalLight.position.copy(camera.position);
		};



		// Setup canvas for dynamic texture
		const textureCanvasElement = document.createElement('canvas');
		textureCanvasElement.width = 1024;
		textureCanvasElement.height = 1024;
		const textureCanvasContext = textureCanvasElement.getContext('2d', { willReadFrequently: true });
		// Fill canvas with a base color
		textureCanvasContext.fillStyle = '#ffffff';
		textureCanvasContext.fillRect(0, 0, textureCanvasElement.width, textureCanvasElement.height);
		// Create dynamic texture
		const dynamicTexture = new THREE.CanvasTexture(textureCanvasElement);
		dynamicTexture.flipY = false; // Ensure the texture is not flipped
		dynamicTexture.needsUpdate = true;
		setDynamicReference(prev => ({
			...prev,
			texture: dynamicTexture
		}));


		// Animate the scene
		let animationId;
		const animate = (time) => {
			animationId = requestAnimationFrame(animate);
			if (controls)
				controls.update();
			renderer.render(scene, camera);
		};
		requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationId);
			renderer.domElement.parentNode.removeChild(renderer.domElement);
			renderer.dispose();
			scene.clear();
			controls.dispose();
			setDynamicReference({
				texture: null,
				controller: null,
				scene: null,
				camera: null,
				renderer: null
			});
		};
	}, [mountReference, setDynamicReference, mtlData, objData]);

	// Load MTL and OBJ files
	React.useEffect(() => {
		if (!mtlData || !objData || !dynamicReference.scene) return;
		const mtlLoader = new MTLLoader();
		mtlLoader.setCrossOrigin('anonymous');
		const materials = mtlLoader.parse(mtlData);
		materials.preload();
		const objLoader = new OBJLoader();
		objLoader.setCrossOrigin('anonymous');
		objLoader.setMaterials(materials);
		const object = objLoader.parse(objData);
		object.traverse((child) => {
			if (child.isMesh) {
				child.material = new THREE.MeshStandardMaterial({
					map: dynamicReference.texture,
					side: THREE.DoubleSide
				});
				child.material.needsUpdate = true;
				if (setLoading) setLoading(false);
			};
		});
		dynamicReference.scene.add(object);
	}, [mtlData, objData, dynamicReference.scene, setDynamicReference]);

	// Start camera animation
	React.useEffect(() => {
		if (!dynamicReference.camera || !dynamicReference.controller) return;
		if (tweenRef.current)
			tweenRef.current.stop();
		if (!cameraTo.animated) {
			dynamicReference.camera.position.set(cameraTo.position.x, cameraTo.position.y, cameraTo.position.z);
			dynamicReference.camera.updateProjectionMatrix();
			dynamicReference.controller.update();
			return;
		};

		tweenRef.current = new TWEEN.Tween(dynamicReference.camera.position)
			.to(cameraTo.position, 1000)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate((coords) => {
				if (dynamicReference.camera && dynamicReference.controller) {
					dynamicReference.camera.position.set(coords.x, coords.y, coords.z);
					dynamicReference.camera.updateProjectionMatrix();
					dynamicReference.controller.update();
				};
			})
			.start();

		let animationId;
		const animate = (time) => {
			animationId = requestAnimationFrame(animate);
			tweenRef.current.update(time);
			if (dynamicReference.camera && dynamicReference.controller)
				dynamicReference.controller.update();
		};
		requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationId);
		};
	}, [dynamicReference.camera, dynamicReference.controller, setDynamicReference, cameraTo]);

	// Handle interactions
	React.useEffect(() => {
		if (!dynamicReference.renderer || !dynamicReference.scene || !dynamicReference.camera) return;
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		const handleMouseClick = (event) => {
			const rect = dynamicReference.renderer.domElement.getBoundingClientRect();
			mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1;

			raycaster.setFromCamera(mouse, dynamicReference.camera);
			const hits = raycaster.intersectObjects(dynamicReference.scene.children, true);

			if (hits.length <= 0) return;

			const interaction = {
				hits,
				raycaster,
				mouse
			};
			onInteract(event, interaction);
		};

		dynamicReference.renderer.domElement.addEventListener('click', handleMouseClick);
		return () => {
			dynamicReference.renderer.domElement.removeEventListener('click', handleMouseClick);
		};
	}, [dynamicReference.renderer, dynamicReference.scene, dynamicReference.camera, onInteract]);

	// Handle onClick event by detecting onMouseDown and onTouchStart
	React.useEffect(() => {
		if (!dynamicReference.renderer?.domElement || !onClick) return;
		// Treshold time: 100ms
		let startTime = 0;
		let clicked = false;
		const start = (e) => {
			startTime = Date.now();
			clicked = true;
		};
		const end = (e) => {
			if (!clicked) return;
			clicked = false;
			if (Date.now() - startTime < 500) // if clicked within 100ms
				onClick(e);
		};

		dynamicReference.renderer.domElement.addEventListener('mousedown', start);
		dynamicReference.renderer.domElement.addEventListener('mouseup', end);
		dynamicReference.renderer.domElement.addEventListener('touchstart', start);
		dynamicReference.renderer.domElement.addEventListener('touchend', end);
		return () => {
			dynamicReference.renderer.domElement.removeEventListener('mousedown', start);
			dynamicReference.renderer.domElement.removeEventListener('mouseup', end);
			dynamicReference.renderer.domElement.removeEventListener('touchstart', start);
			dynamicReference.renderer.domElement.removeEventListener('touchend', end);
		};
	}, [dynamicReference, onClick]);
	return (
		<div ref={mountReference} {...props} />
	);
};

export default ModelViewer;