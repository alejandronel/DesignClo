import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import * as THREE from 'three';
import { Sheet } from 'react-modal-sheet';

import Joystick from '../components/Joystick';
import NumberInput from '../components/NumberInput';

import checkFont from '../utils/checkFont';
import getImageAverage from '../utils/getImageAverage';
import cropAlpha from '../utils/cropAlpha';

import {
	App,
	Flex,
	Space,
	Button,
	Dropdown,
	ColorPicker,
	Popover,
	Drawer,
	Skeleton,
	Typography,
	Card,
	Input,
	Select,
	Badge
} from 'antd';
import Icon, {
	EditOutlined,
	LeftOutlined,
	CaretDownOutlined,
	FontColorsOutlined,
	BgColorsOutlined,
	FileImageOutlined,
	VideoCameraOutlined,
	InfoCircleOutlined,
	EllipsisOutlined,
	CaretUpOutlined,
	CloseOutlined,
	DeleteOutlined,
	UndoOutlined,
	RedoOutlined
} from '@ant-design/icons';
import CreateIcon from '../assets/icons/CreateIcon';

const { Text } = Typography;

import PromptModal from '../modals/PromptModal';
import ExportImageModal from '../modals/ExportImageModal';

/**
 * @typedef {{
 * 	texture: THREE.CanvasTexture;
 * 	controller: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;
 * 	scene: THREE.Scene;
 * 	camera: THREE.PerspectiveCamera;
 * 	renderer: THREE.WebGLRenderer;
 * }} DynamicReference
 */
/**
 * @typedef {{
 * 	type: 'image';
 * 	source: {
 * 		image: HTMLImageElement;
 * 		size: Number;
 * 	};
 * }} BaseImageLayer
 */
/**
 * @typedef {{
 * 	type: 'text';
 * 	source: {
 * 		text: String;
 * 		font?: String;
 * 		size?: Number;
 * 		color?: String;
 * 	}
 * }} BaseTextLayer
 */
/**
 * @typedef {{
 * 	id: String;
 * 	position: { x: Number, y: Number };
 * 	rotation: Number;
 * }} BaseLayer
 */
/** @typedef {BaseTextLayer & BaseLayer} TextLayer */
/** @typedef {BaseImageLayer & BaseLayer} ImageLayer */
/**
 * @typedef {TextLayer | ImageLayer} Layer
 */
/**
 * @typedef {{
 * 	id: String;
 * 	baseColor: String;
 * 	layers: Layer[];
 * 	active: Boolean;
 * }} HistoryEntry
 */
/**
 * @typedef {{
 * 	id: String;
 * 	image: HTMLImageElement;
 * 	active: Boolean;
 * }} Asset
 */

import ModelViewer from '../components/ModelViewer';

const Canvas = () => {
	const navigate = useNavigate();

	/** @type {import('./Create').Form} */
	const form = {
		garment: useLocation().state?.form?.garment || 't-shirt',
		sleeve: useLocation().state?.form?.sleeve || 'short',
		collar: useLocation().state?.form?.collar || 'ringer-neck',
		design: useLocation().state?.form?.design || 'minimal'
	};
	/** @type {[DynamicReference, React.Dispatch<React.SetStateAction<DynamicReference>>]} */
	const [dynamicState, setDynamicState] = React.useState({
		texture: null,
		controller: null,

		scene: null,
		camera: null,
		renderer: null
	});
	const [cameraTo, setCameraTo] = React.useState({
		position: { x: 0, y: 2, z: 5 },
		animated: false
	});

	const [menuSheetOpen, setMenuSheetOpen] = React.useState(false);
	const [layerMenuDrawerOpen, setLayerMenuDrawerOpen] = React.useState(false);
	const { modal } = App.useApp();
	const confirmBackNavigation = () => {
		if (window.openedModal) {
			window.openedModal.destroy();
			window.openedModal = null;
		};
		const unsavedChangesModal = modal.confirm({
			title: 'Unsaved Changes',
			content: 'You have unsaved changes. Are you sure you want to leave?',
			closable: true,
			maskClosable: true,
			okText: 'Leave',
			cancelText: 'Stay',
			okButtonProps: {
				danger: true
			},
			onOk: () => {
				navigate('/create/design', {
					state: {
						form: {
							garment: form.garment,
							sleeve: form.sleeve,
							collar: form.collar,
							design: ''
						}
					}
				});
			},
			onCancel: () => {
				if (window.openedModal) {
					window.openedModal.destroy();
					window.openedModal = null;
				};
			},
			styles: {
				content: {
					padding: 32
				}
			}
		});
		window.openedModal = unsavedChangesModal;
	};
	React.useEffect(() => {
		const androidBackCallback = () => {
			if (window.openedModal) {
				window.openedModal.destroy();
				window.openedModal = null;
				return;
			};
			if (menuSheetOpen) {
				setMenuSheetOpen(false);
				return;
			};
			confirmBackNavigation();
		};
		window.androidBackCallback = androidBackCallback;
		return () => {
			if (window.androidBackCallback === androidBackCallback)
				window.androidBackCallback = null;
		};
	}, []);
	const [assetDrawerOpen, setAssetDrawerOpen] = React.useState(false);
	const [assetSources, setAssetSources] = React.useState([
		'/assets/logo.png'
	]);
	const addAssetSource = React.useCallback((assetUrl) => {
		setAssetSources((prevSources) => [...prevSources, assetUrl]);
	}, [setAssetSources]);
	/** @type {[Asset[], React.Dispatch<React.SetStateAction<Asset[]>>]} */
	const [assets, setAssets] = React.useState([]);
	React.useEffect(() => {
		setAssets([]);
		const loadAssets = async () => {
			const loadedAssets = await Promise.all(assetSources.map(async (src) => {
				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.src = src;
				await img.decode();
				return { id: `asset-${Date.now()}`, image: img, active: false };
			}));
			setAssets(loadedAssets);
		};
		loadAssets();
	}, [assetSources]);
	const [promptModalOpen, setPromptModalOpen] = React.useState(false);

	/** @type {[('text' | 'image' | null), React.Dispatch<React.SetStateAction<('text' | 'image' | null)>>]} */
	const [tool, setTool] = React.useState('');
	/** @type {[Layer, React.Dispatch<React.SetStateAction<Layer>>]} */
	const [editing, setEditing] = React.useState({});
	const [adjusting, setAdjusting] = React.useState(false);

	/** @type {[Layer[], React.Dispatch<React.SetStateAction<Layer[]>>]} */
	const [layers, setLayers] = React.useState([]);
	const [baseColor, setBaseColor] = React.useState('#ffffff');
	React.useEffect(() => {
		const render = () => {
			if (!dynamicState.texture || !baseColor) return;
			// Update Base Color
			const canvas = dynamicState.texture.image;
			const context = canvas.getContext('2d', { willReadFrequently: true });
			context.fillStyle = baseColor;
			context.fillRect(0, 0, canvas.width, canvas.height);

			// Update Model Layers
			for (const layer of layers) {
				context.save();
				context.translate((layer.position.x * canvas.width) / 100, (layer.position.y * canvas.height) / 100);
				context.scale(1, -1); // Flip the context vertically
				context.rotate(layer.rotation * (Math.PI / 180));

				if (layer.type === 'image') {
					// Get original dimensions and aspect ratio
					const originalWidth = layer.source.image.width;
					const originalHeight = layer.source.image.height;
					const originalAspect = originalWidth / originalHeight;

					// Rescale to fit the size
					const size = layer.source.size; // Default size if not specified
					let newWidth = 0;
					let newHeight = 0;
					if (originalAspect > 1) {
						// Landscape image
						newWidth = size;
						newHeight = size / originalAspect;
					} else {
						// Portrait or square image
						newHeight = size;
						newWidth = size * originalAspect;
					};

					context.drawImage(layer.source.image, -newWidth / 2, -newHeight / 2, newWidth, newHeight);

					if (editing.id === layer.id) {
						context.strokeStyle = '#ff0000';
						context.lineWidth = 2;
						context.setLineDash([12, 12]);
						context.strokeRect(-newWidth / 2, -newHeight / 2, newWidth, newHeight);
						context.setLineDash([]); // Reset to solid line
					};

					context.restore();
				} else if (layer.type === 'text') {
					context.font = `${layer.source.size}px ${layer.source.font}`;
					context.fillStyle = layer.source.color || '#000000';
					context.textAlign = 'center';
					context.textBaseline = 'middle';
					context.fillText(layer.source.text || 'No Text', 0, 0);

					if (editing.id === layer.id) {
						context.strokeStyle = '#ff0000';
						const textMetrics = context.measureText(layer.source.text || 'No Text');
						const padding = 8; // Padding around the text
						context.lineWidth = 2;
						context.setLineDash([12, 12]);
						context.strokeRect(-textMetrics.width / 2 - padding, -layer.source.size / 2 - padding, textMetrics.width + padding * 2, layer.source.size + padding * 2);
						context.setLineDash([]); // Reset to solid line
					};

					context.restore();
				};
			};
			dynamicState.texture.needsUpdate = true;
		};
		requestAnimationFrame(render);
	}, [dynamicState, editing, baseColor, layers]);
	/** @type {[HistoryEntry[], React.Dispatch<React.SetStateAction<HistoryEntry[]>>]} */
	const [history, setHistory] = React.useState([{
		id: `history-${Date.now()}`,
		baseColor: '#ffffff',
		layers: [],
		active: true
	}]);
	// React.useEffect(() => { console.log(JSON.stringify(history, null, 2)) }, [history]);
	const pushHistory = React.useCallback((baseColor, layers) => {
		console.log('Previous History:', JSON.stringify(history, null, 2));
		// Find the current active entry
		const currentActiveIndex = history.findIndex(entry => entry.active);
		// Check if the current active entry is the last one in the array
		if (currentActiveIndex !== -1 && currentActiveIndex === history.length - 1) {
			// If it is, push a new entry
			const previousEntries = history.map(entry => ({ ...entry, active: false }));
			const newEntry = {
				id: `history-${Date.now()}`,
				baseColor: baseColor,
				layers: [...layers],
				active: true
			};
			previousEntries.push(newEntry);
			if (previousEntries.length > 50) previousEntries.shift(); // Remove the oldest entry
			setHistory(previousEntries);
			console.log('History updated:', JSON.stringify(previousEntries, null, 2));
			return;
		};
		// If not, remove all entries after the current active one
		const previousEntries = history.slice(0, currentActiveIndex + 1).map(entry => ({ ...entry, active: false }));
		const newEntry = {
			id: `history-${Date.now()}`,
			baseColor: baseColor,
			layers: [...layers],
			active: true
		};
		setHistory([...previousEntries, newEntry]);
	}, [history, baseColor, layers]);
	const undoHistory = React.useCallback(() => {
		if (history.length === 0) return;
		// Find current active entry
		const currentActiveIndex = history.findIndex(entry => entry.active);
		if (currentActiveIndex === -1) return;
		// Get entry before the current active one
		const previousEntry = history[currentActiveIndex - 1];
		if (!previousEntry) return;
		// Set the previous entry as active and deactivate the current one
		const updatedHistory = history.map((entry, index) => ({
			...entry,
			active: index === currentActiveIndex - 1
		}));
		setHistory(updatedHistory);
		setBaseColor(previousEntry.baseColor);
		setLayers([...previousEntry.layers]);
	}, [history]);
	const redoHistory = React.useCallback(() => {
		if (history.length === 0) return;
		// Find current active entry
		const currentActiveIndex = history.findIndex(entry => entry.active);
		if (currentActiveIndex === -1) return;
		// Get entry after the current active one
		const nextEntry = history[currentActiveIndex + 1];
		if (!nextEntry) return;
		// Set the next entry as active and deactivate the current one
		const updatedHistory = history.map((entry, index) => ({
			...entry,
			active: index === currentActiveIndex + 1
		}));
		setHistory(updatedHistory);
		setBaseColor(nextEntry.baseColor);
		setLayers([...nextEntry.layers]);
	}, [history]);
	const [averageColors, setAverageColors] = React.useState([]);
	React.useEffect(() => {
		if (!layers || layers.length === 0) return;
		const getAverageColors = async () => {
			const layerColors = await Promise.all(layers.map(async (layer) => {
				if (layer.type === 'image' && layer.source.image)
					return await getImageAverage(layer.source.image, 2);
				if (layer.type === 'text')
					return [layer.source.color];
				return [];
			}));
			const allColors = layerColors.flat();
			// Remove duplicates
			const uniqueColors = Array.from(new Set(allColors.map(color => JSON.stringify(color)))).map(color => JSON.parse(color));
			setAverageColors(uniqueColors);
		};
		requestAnimationFrame(getAverageColors);
	}, [layers]);

	const notification = App.useApp().notification;
	const onInteract = React.useCallback((event, interaction) => {
		if (!dynamicState.renderer || !dynamicState.scene || !dynamicState.camera) return;

		const { hits } = interaction;

		const uv = hits[0].uv;

		// Create text 'Hello' at the clicked position
		const newLayer = {
			id: `layer-${Date.now()}`,
			position: { x: uv.x * 100, y: uv.y * 100 },
			rotation: 0
		};
		if (!tool) return; // No tool selected

		if (tool === 'text') {
			newLayer.type = 'text';
			newLayer.source = {
				text: 'Text',
				font: 'Arial',
				size: 32,
				color: '#000000'
			};
		} else if (tool === 'image') {
			const activeAsset = assets.find(asset => asset.active);
			if (!activeAsset) {
				notification.error({
					message: 'No Asset Selected',
					description: 'Please select an asset from the Assets menu.',
					style: { padding: 16 },
					closeIcon: null
				});
				return;
			};
			newLayer.type = 'image';
			newLayer.source = {
				image: activeAsset.image,
				size: dynamicState.texture.image.width * 0.25 // Default size
			};
		};

		setLayers((prevLayers) => [...prevLayers, newLayer]);
		setAssets((prevAssets) => {
			const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
			return newAssets;
		}); // Deselect all assets
		setTool(null); // Reset tool after adding layer
		setEditing(newLayer); // Set the new layer as the editing layer
		pushHistory(baseColor, [...layers, newLayer]);
	}, [tool, dynamicState.renderer, dynamicState.scene, dynamicState.camera]);



	const [availableFonts, setAvailableFonts] = React.useState([]);
	React.useEffect(() => {
		setAvailableFonts([]);
		const fonts = [
			'Arial',
			'Verdana',
			'Tahoma',
			'Trebuchet MS',
			'Times New Roman',
			'Georgia',
			'Garamond',
			'Courier New',
			'Brush Script MT',
			'Roboto',
			'Open Sans',
			'Lato',
			'Montserrat',
			'Raleway',
			'Poppins',
			'Monospace'
		];
		const checkFonts = async () => {
			const available = [];
			for (const font of fonts) {
				if (await checkFont(font)) {
					available.push(font);
				};
			};
			setAvailableFonts(available);
		};
		checkFonts();
	}, []);

	React.useEffect(() => {
		if (editing.id && editing.type === 'text') {
			setTimeout(() => {
				const input = document.getElementById('layer-text-input');
				if (input) {
					input.focus();
					input.select();
				};
			}, 500); // Delay to ensure the input is rendered
		};
	}, [editing.id]);

	const [loading, setLoading] = React.useState(true);

	const [exportPreviewImages, setExportPreviewImages] = React.useState([]);
	const [exportImageModalOpen, setExportImageModalOpen] = React.useState(false);
	const [zoomLevel, setZoomLevel] = React.useState(10);
	React.useEffect(() => {
		if (!dynamicState.controller || !dynamicState.camera) return;
		const handleChange = () => {
			const distance = dynamicState.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
			setZoomLevel(distance);
		};

		dynamicState.controller?.addEventListener('change', handleChange);
		return () => {
			dynamicState.controller?.removeEventListener('change', handleChange);
		};
	}, [dynamicState.controller, dynamicState.camera]);
	return (
		<Flex
			vertical
			className='page-container'
			style={{
				background: 'radial-gradient(circle at center, #1f1f1f, #000000)'
			}}
		>
			<Flex justify='space-between' align='center' style={{ position: 'relative', padding: '16px 32px', zIndex: 10 }}>
				<Button
					type='primary'
					size='large'
					icon={<LeftOutlined />}
					onClick={() => confirmBackNavigation()}
				/>
				<Popover
					arrow
					placement='bottom'
					trigger='hover'
					content={(
						<Flex vertical align='flex-start' gap={8}>
							<Text>Garment: {form.garment}</Text>
							{form.garment !== 'polo-shirt' && <Text>Sleeve: {form.sleeve}</Text>}
							<Text>Collar: {form.collar}</Text>
							<Text>Design: {form.design}</Text>

							<Button
								type='primary'
								size='small'
								danger
								style={{ width: '100%' }}
								onClick={() => {
									if (window.openedModal) {
										window.openedModal.destroy();
										window.openedModal = null;
									};
									const unsavedChangesModal = modal.confirm({
										title: 'Unsaved Changes',
										content: 'You have unsaved changes. Are you sure you want to reset?',
										closable: true,
										maskClosable: true,
										okText: 'Reset',
										cancelText: 'Cancel',
										okButtonProps: {
											danger: true
										},
										onOk: () => {
											location.reload(true);
										},
										onCancel: () => {
											if (window.openedModal) {
												window.openedModal.destroy();
												window.openedModal = null;
											};
										},
										styles: {
											content: {
												padding: 32
											}
										}
									});
									window.openedModal = unsavedChangesModal;
								}}
							>
								Reset
							</Button>
						</Flex>
					)}
				>
					<Button
						type='default'
						size='large'
						icon={<InfoCircleOutlined />}
					/>
				</Popover>
			</Flex>

			<div style={{ flex: 1 }}>
				<ModelViewer
					form={form}
					dynamicReference={dynamicState}
					setDynamicReference={setDynamicState}
					onInteract={onInteract}
					setLoading={setLoading}
					cameraTo={cameraTo}
					style={{
						position: 'absolute',
						width: '200vw',
						height: '200vh',
						top: 0,
						left: 0,
						transform: 'scale(0.5) translateX(-50%) translateY(-50%)'
					}}
					onClick={(e) => {
						setEditing({}); // Deselect any editing layer
					}}
				/>
			</div>



			<Flex
				vertical
				align='end'
				gap={8}
				style={{ position: 'relative', width: '100%', padding: '16px 32px', zIndex: 10 }}
			>
				<Space.Compact size='large'>
					<Button
						type='default'
						icon={<UndoOutlined />}
						disabled={loading || history.length === 0 || history[0].active}
						onClick={() => undoHistory()}
					/>
					<Badge
						size='small'
						count={(() => {
							const currentActiveIndex = history.findIndex(entry => entry.active);
							if (currentActiveIndex === -1) return 0;
							return history.length - currentActiveIndex - 1;
						})()}
						style={{ zIndex: 10 }}
					>
						<Button
							type='default'
							icon={<RedoOutlined />}
							disabled={loading || history.length === 0 || history[history.length - 1].active}
							onClick={() => redoHistory()}
						/>
					</Badge>
					<Dropdown
						arrow
						placement='top'
						trigger='hover'
						menu={{
							items: [
								{ key: 'front', label: 'Front' },
								{ key: 'back', label: 'Back' },
								{ key: 'left', label: 'Left' },
								{ key: 'right', label: 'Right' }
							],
							onClick: ({ key }) => {
								const positions = {
									front: { x: 0, y: 2, z: 10 },
									back: { x: 0, y: 2, z: -10 },
									left: { x: -10, y: 2, z: 0 },
									right: { x: 10, y: 2, z: 0 }
								};

								setCameraTo({
									position: positions[key],
									animated: true
								});
							}
						}}
					>
						<Button
							type='default'
							icon={<VideoCameraOutlined />}
							disabled={loading}
						/>
					</Dropdown>
				</Space.Compact>
				<Space.Compact
					size='large'
					style={{ width: '100%' }}
				>
					<Popover
						arrow
						placement='topLeft'
						open={tool === 'text'}
						content={<Text>Tap on the garment to insert text</Text>}
					>
						<Button
							type={tool === 'text' ? 'primary' : 'default'}
							style={{ flex: 1 }}
							icon={(
								<Flex vertical align='center' justify='center' gap={4}>
									<FontColorsOutlined style={{ fontSize: 16 }} />
									<Text style={{ color: 'currentcolor', fontSize: 8 }}>Text</Text>
								</Flex>
							)}
							disabled={loading}
							onClick={(e) => {
								setEditing({});
								setTool(null); // Deselect tool
								setAssets((prevAssets) => {
									const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
									return newAssets;
								}); // Deselect all assets
								if (tool === 'text') {
									setTool(null); // Deselect tool
								} else {
									setTool('text'); // Select text tool
									setLayerMenuDrawerOpen(false); // Close layer menu if open
									setAssetDrawerOpen(false); // Close asset modal if open
									setAssets((prevAssets) => {
										const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
										return newAssets;
									}); // Deselect all assets
								};
							}}
						>
						</Button>
					</Popover>
					<ColorPicker
						arrow
						placement='top'
						disabledAlpha
						value={baseColor}
						onChange={(color) => setBaseColor(color.toHexString())}
						presets={[
							{
								label: 'Layers',
								colors: averageColors
							}
						]}
						onChangeComplete={(color) => {
							pushHistory(color.toHexString(), layers);
						}}
					>
						<Button
							type='default'
							style={{ flex: 1 }}
							icon={(
								<Flex vertical align='center' justify='center' gap={4}>
									<BgColorsOutlined style={{ fontSize: 16 }} />
									<Text style={{ color: 'currentcolor', fontSize: 8 }}>Base Color</Text>
								</Flex>
							)}
							disabled={loading}
							onClick={() => {
								setEditing({});
								setTool(null); // Deselect tool
								setAssets((prevAssets) => {
									const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
									return newAssets;
								}); // Deselect all assets
							}}
						/>
					</ColorPicker>
					<Popover
						arrow
						placement='top'
						open={tool === 'image'}
						content={(
							<Flex align='center' gap={8}>
								<img src={assets.find(asset => asset.active)?.image?.src || '/assets/logo.png'} alt='Text Tool' style={{ width: 64, height: 64, objectFit: 'contain' }} />
								<Text>Tap on the garment to insert an image</Text>
							</Flex>
						)}
					>
						<Button
							type={tool === 'image' ? 'primary' : 'default'}
							style={{ flex: 1 }}
							icon={(
								<Flex vertical align='center' justify='center' gap={4}>
									<FileImageOutlined style={{ fontSize: 16 }} />
									<Text style={{ color: 'currentcolor', fontSize: 8 }}>Assets</Text>
								</Flex>
							)}
							disabled={loading}
							onClick={(e) => {
								setEditing({});
								setTool(null); // Deselect tool
								setAssets((prevAssets) => {
									const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
									return newAssets;
								}); // Deselect all assets
								if (tool === 'image') {
									setTool(null);
									setAssets((prevAssets) => {
										const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
										return newAssets;
									}); // Deselect all assets
								} else {
									setAssetDrawerOpen(true);
								};
							}}
						/>
					</Popover>
					<Button
						type='default'
						style={{ flex: 1 }}
						icon={(
							<Flex vertical align='center' justify='center' gap={4}>
								<EditOutlined style={{ fontSize: 16 }} />
								<Text style={{ color: 'currentcolor', fontSize: 8 }}>Layers</Text>
							</Flex>
						)}
						disabled={loading}
						onClick={() => {
							setEditing({});
							setTool(null); // Deselect tool
							setAssets((prevAssets) => {
								const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
								return newAssets;
							}); // Deselect all assets
							setLayerMenuDrawerOpen(true); // Open layer menu
						}}
					/>
					<Button
						type='default'
						style={{ flex: 1 }}
						icon={(
							<Flex vertical align='center' justify='center' gap={4}>
								<EllipsisOutlined style={{ fontSize: 16 }} />
								<Text style={{ color: 'currentcolor', fontSize: 8 }}>Menu</Text>
							</Flex>
						)}
						disabled={loading}
						onClick={() => {
							setEditing({});
							setTool(null); // Deselect tool
							setAssets((prevAssets) => {
								const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
								return newAssets;
							}); // Deselect all assets
							setMenuSheetOpen(true); // Open menu sheet
						}}
					/>
				</Space.Compact>
			</Flex>



			<Drawer
				placement='right'
				open={layerMenuDrawerOpen}
				onClose={() => setLayerMenuDrawerOpen(false)}
				width={256}
				title='Layers'
				styles={{
					header: {
						padding: 0,
						paddingTop: 'env(safe-area-inset-top)'
					},
					body: {
						padding: 0,
						paddingBottom: 'env(safe-area-inset-bottom)'
					}
				}}
			>
				<Flex vertical align='stretch' gap={8} style={{ padding: 16 }}>
					{[...layers].reverse().map((layer, index) => (
						<Card
							key={index}
							size='small'
							style={{
								width: '100%',
								height: 'auto',
								textAlign: 'center'
							}}

							onClick={(event) => {
								setEditing(layer);
								setLayerMenuDrawerOpen(false); // Close layer menu when editing
							}}
						>
							<Space.Compact style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: 8, backgroundColor: '#1f1f1f', zIndex: 1 }}>
								<Button
									type='default'
									size='small'
									icon={<CaretUpOutlined />}
									disabled={layers.findIndex(l => l.id === layer.id) === layers.length - 1}
									onClick={(e) => {
										e.stopPropagation(); // Prevent card click event
										setLayers((prevLayers) => {
											const index = prevLayers.findIndex(l => l.id === layer.id);
											if (index < prevLayers.length - 1) {
												const newLayers = [...prevLayers];
												[newLayers[index + 1], newLayers[index]] = [newLayers[index], newLayers[index + 1]];
												pushHistory(baseColor, newLayers);
												return newLayers;
											};
											return prevLayers;
										});
									}}
								/>
								<Button
									type='default'
									size='small'
									icon={<CaretDownOutlined />}
									disabled={layers.findIndex(l => l.id === layer.id) === 0}
									onClick={(e) => {
										e.stopPropagation(); // Prevent card click event
										setLayers((prevLayers) => {
											const index = prevLayers.findIndex(l => l.id === layer.id);
											if (index > 0) {
												const newLayers = [...prevLayers];
												[newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
												pushHistory(baseColor, newLayers);
												return newLayers;
											}
											return prevLayers;
										});
									}}
								/>
								<Button
									type='default'
									size='small'
									icon={<DeleteOutlined />}
									onClick={(e) => {
										e.stopPropagation(); // Prevent card click event
										setLayers((prevLayers) => {
											const newLayers = prevLayers.filter(l => l.id !== layer.id)
											pushHistory(baseColor, newLayers);
											return newLayers;
										});
									}}
								/>
							</Space.Compact>
							{layer.type === 'text' ? (
								<Text style={{ color: '#ffffff' }}>{layer.source.text || 'No Text'}</Text>
							) : (
								<img
									src={layer.source.image.src}
									alt='Layer'
									style={{
										width: '100%',
										height: 'auto',
										objectFit: 'contain'
									}}
									/>
							)}
						</Card>
					))}
				</Flex>
			</Drawer>
			<Drawer
				placement='right'
				open={assetDrawerOpen}
				onClose={() => {
					setAssetDrawerOpen(false);
					setAssets((prevAssets) => {
						const newAssets = prevAssets.map(asset => ({ ...asset, active: false }));
						return newAssets;
					}); // Deselect all assets
					setEditing({});
				}}
				width={256}
				title='Assets'
				styles={{
					header: {
						padding: 0,
						paddingTop: 'env(safe-area-inset-top)'
					},
					body: {
						padding: 0,
						paddingBottom: 'env(safe-area-inset-bottom)'
					}
				}}
				footer={(
					<Flex vertical justify='center' align='center' gap={8}>
						<Button
							type='primary'
							style={{ width: '100%' }}
							onClick={() => setPromptModalOpen(true)}
						>
							<Flex align='center' justify='center' gap={8}>
								<Icon component={CreateIcon} style={{ fontSize: 32 }} />
								<Text style={{ color: 'currentcolor' }}>Create</Text>
							</Flex>
						</Button>
						<Button
							type='Text'
							size='small'
							style={{ width: '100%' }}
							onClick={() => {
								const input = document.createElement('input');
								input.type = 'file';
								input.accept = 'image/*';
								input.onchange = async (e) => {
									const file = e.target.files[0];
									if (!file) return;
									const img = new Image();
									img.src = URL.createObjectURL(file);
									await img.decode();
									addAssetSource(img.src);
								};
								input.click();
							}}
						>
							<Text style={{ fontSize: 12 }}>Or Import Asset from Gallery</Text>
						</Button>
					</Flex>
				)}
			>
				<Flex vertical gap={8} style={{ padding: 16 }}>
					{assets.map((asset, index) => (
						<Card
							key={index}
							size='small'
							style={{ width: '100%', height: 'auto', textAlign: 'center' }}
							onClick={() => {
								const newAssets = assets.map(a => ({ ...a, active: false }));
								setAssets(newAssets);
								// Find the clicked asset and set it as active
								const updatedAsset = { ...asset, active: true };
								const index = newAssets.findIndex(a => a.id === asset.id);
								if (index !== -1) {
									newAssets[index] = updatedAsset;
									setAssets(newAssets);
									setTool('image'); // Set tool to image when asset is selected
									setAssetDrawerOpen(false); // Close the asset modal
								};
							}}
						>
							<Button
								type='default'
								size='small'
								danger
								style={{ position: 'absolute', top: 8, right: 8 }}
								icon={<DeleteOutlined />}
								onClick={(e) => {
									e.stopPropagation(); // Prevent card click event
									setAssetSources((prevSources) => {
										const newSources = prevSources.filter(src => src !== asset.image.src);
										return newSources;
									});
								}}
							/>
							<img
								src={asset.image.src}
								alt='Asset'
								style={{
									width: '100%',
									height: 'auto',
									borderRadius: '4px',
									padding: '8px'
								}}
							/>
						</Card>
					))}
				</Flex>
			</Drawer>
			<Popover
				arrow
				fresh
				placement='left'
				open={editing.id}
				title={(
					<Flex justify='flex-start' align='center' gap={8}>
						<Button
							type='text'
							icon={<CloseOutlined />}
							onClick={() => setEditing({})}
						/>
						<Text style={{ flex: 1 }}>Edit Layer</Text>

						<Space.Compact>
							<Button
								type='default'
								size='small'
								icon={<CaretUpOutlined />}
								disabled={layers.findIndex(l => l.id === editing.id) === layers.length - 1}
								onClick={(e) => {
									e.stopPropagation(); // Prevent popover close
									setLayers((prevLayers) => {
										const index = prevLayers.findIndex(l => l.id === editing.id);
										if (index < prevLayers.length - 1) {
											const newLayers = [...prevLayers];
											[newLayers[index + 1], newLayers[index]] = [newLayers[index], newLayers[index + 1]];
											pushHistory(baseColor, newLayers);
											return newLayers;
										};
										return prevLayers;
									});
								}}
							/>
							<Button
								type='default'
								size='small'
								icon={<CaretDownOutlined />}
								disabled={layers.findIndex(l => l.id === editing.id) === 0}
								onClick={(e) => {
									e.stopPropagation(); // Prevent popover close
									setLayers((prevLayers) => {
										const index = prevLayers.findIndex(l => l.id === editing.id);
										if (index > 0) {
											const newLayers = [...prevLayers];
											[newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
											pushHistory(baseColor, newLayers);
											return newLayers;
										};
										return prevLayers;
									});
								}}
							/>
							<Button
								type='default'
								size='small'
								icon={<DeleteOutlined />}
								onClick={(e) => {
									e.stopPropagation(); // Prevent popover close
									setLayers((prevLayers) => {
										const newLayers = prevLayers.filter(l => l.id !== editing.id);
										pushHistory(baseColor, newLayers);
										return newLayers;
									});
									setEditing({}); // Deselect layer after deletion
								}}
							/>
						</Space.Compact>
					</Flex>
				)}
				styles={{
					body: {
						width: 256,
						maxHeight: 'calc(100vh - 256px)',
						backgroundColor: 'rgba(31, 31, 31, 0.25)',
						overflowY: 'auto'
					},
					root: {
						opacity: adjusting ? 0.25 : 1,
						transition: 'opacity var(--ant-motion-duration-slow) ease-in-out',
						zIndex: 1000
					}
				}}
				content={(
					<Flex vertical gap={8} style={{ padding: 16 }}>
						{editing.type === 'text' && (
							<>
								<Flex vertical style={{ width: '100%' }}>
									<Text type='secondary'>Text</Text>
									<Input
										autoFocus
										id='layer-text-input'
										placeholder='Enter text'
										value={editing.source?.text}
										onChange={(e) => {
											const newLayer = { ...editing, source: { ...editing.source, text: e.target.value } };
											setEditing(newLayer);
											setLayers((prevLayers) => {
												const newLayers = prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
												pushHistory(baseColor, newLayers);
												return newLayers;
											});
										}}
										style={{ width: '100%', textAlign: 'center' }}
									/>
								</Flex>
								<Flex vertical style={{ width: '100%' }}>
									<Text type='secondary'>Font Family</Text>
									<Select
										value={editing.source?.font}
										onChange={(value) => {
											const newLayer = { ...editing, source: { ...editing.source, font: value } };
											setEditing(newLayer);
											setLayers((prevLayers) => {
												const newLayers = prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
												pushHistory(baseColor, newLayers);
												return newLayers;
											});
										}}
									>
										{availableFonts.map((font, index) => (
											<Select.Option key={index} value={font}>
												<Text style={{ fontFamily: `${font} !important` }}>{font}</Text>
											</Select.Option>
										))}
									</Select>
								</Flex>
								<Flex justify='space-between' align='flex-start' style={{ width: '100%' }}>
									<Text type='secondary'>Font Size</Text>
									<NumberInput
										min={editing.source?.size > 256 ? editing.source?.size - 256 : 0}
										max={editing.source?.size + 256 < dynamicState.texture?.image?.width ? editing.source?.size + 256 : dynamicState.texture?.image?.width}
										step={2}
										label='Font Size'
										style={{ width: '50%' }}
										preset={{
											suffix: 'px',
											values: [...Array.from({ length: 10 }, (_, i) => Math.pow(2, i + 1))]
										}}
										get={editing.source?.size}
										set={(value) => {
											const newLayer = { ...editing, source: { ...editing.source, size: value } };
											setEditing(newLayer);
											setLayers((prevLayers) => {
												return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
											});
										}}
										setSliding={setAdjusting}
										onStop={(value) => { pushHistory(baseColor, layers.map(layer => layer.id === editing.id ? { ...layer, source: { ...layer.source, size: value } } : layer)); }}
									/>
								</Flex>
							</>
						)}
						{editing.type === 'image' && (
							<>
								<Card
									size='small'
									style={{ width: '100%', height: 128 }}
									cover={
										<img
											src={editing.source?.image.src}
											alt='Layer'
											style={{
												width: '100%',
												height: 128,
												objectFit: 'contain'
											}}
										/>
									}
									onClick={() => {
										const input = document.createElement('input');
										input.type = 'file';
										input.accept = 'image/*';
										input.onchange = async (e) => {
											const file = e.target.files[0];
											if (!file) return;
											const img = new Image();
											img.src = URL.createObjectURL(file);
											await img.decode();
											const newLayer = { ...editing, source: { ...editing.source, image: img } };
											setEditing(newLayer);
											setLayers((prevLayers) => {
												return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
											});
										};
										input.click();
										pushHistory();
									}}
								/>
								<Flex justify='space-between' align='flex-start' style={{ width: '100%' }}>
									<Text type='secondary'>Size</Text>
									<NumberInput
										min={editing.source?.size > 256 ? editing.source?.size - 256 : 0}
										max={editing.source?.size + 256 < dynamicState.texture?.image?.width ? editing.source?.size + 256 : dynamicState.texture?.image?.width}
										step={2}
										label='Size'
										style={{ width: '50%' }}
										preset={{
											suffix: 'px',
											values: [...Array.from({ length: 10 }, (_, i) => Math.pow(2, i + 1))]
										}}
										get={editing.source?.size}
										set={(value) => {
											const newLayer = { ...editing, source: { ...editing.source, size: value } };
											setEditing(newLayer);
											setLayers((prevLayers) => {
												return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
											});
										}}
										setSliding={setAdjusting}
										onStop={(value) => { pushHistory(baseColor, layers.map(layer => layer.id === editing.id ? { ...layer, source: { ...layer.source, size: value } } : layer)); }}
									/>
								</Flex>
							</>
						)}
						<Flex justify='space-between' align='flex-start' style={{ width: '100%' }}>
							<Text type='secondary'>Rotation</Text>
							<NumberInput
								min={-360}
								max={360}
								step={1}
								label='Rotation'
								style={{ width: '50%' }}
								preset={{
									suffix: '°',
									values: [...Array.from({ length: 9 }, (_, i) => i * 45)]
								}}
								get={editing.rotation}
								set={(value) => {
									const newLayer = { ...editing, rotation: value };
									setEditing(newLayer);
									setLayers((prevLayers) => {
										return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
									});
								}}
								setSliding={setAdjusting}
								onStop={(value) => { pushHistory(baseColor, layers.map(layer => layer.id === editing.id ? { ...layer, rotation: value } : layer)); }}
							/>
						</Flex>
						{editing.type === 'text' && (
							<Flex vertical justify='space-between' align='flex-start' style={{ width: '100%' }}>
								<Text type='secondary'>Color</Text>
								<ColorPicker
									showText
									size='small'
									placement='top'
									style={{ width: '100%' }}
									color={editing.source?.color}
									value={editing.source?.color || '#000000'}
									onChange={(color) => {
										const newLayer = { ...editing, source: { ...editing.source, color: color.toHexString() } };
										setEditing(newLayer);
										setLayers((prevLayers) => {
											return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
										});
									}}
									presets={[
										{
											label: 'Layers',
											colors: averageColors
										}
									]}
									onChangeComplete={(color) => {
										pushHistory();
									}}
								/>
							</Flex>
						)}
						<Flex vertical align='center' gap={4} style={{ width: '100%' }}>
							<Text type='secondary'>Position</Text>
							<Joystick
								size={128}
								onMove={({ x, y }) => {
									const newLayer = {
										...editing,
										position: {
											x: (editing.position.x + ((x * 128) * (zoomLevel * 0.1)) / dynamicState.texture.image.width),
											y: (editing.position.y + ((y * 128) * (zoomLevel * 0.1)) / dynamicState.texture.image.height)
										}
									};
									setEditing(newLayer);
									setLayers((prevLayers) => {
										return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
									});
								}}
								setMoving={setAdjusting}
								onStop={() => {
									setAdjusting(false);
									pushHistory(baseColor, layers.map(layer => layer.id === editing.id ? { ...layer, position: editing.position } : layer));
								}}
							/>
							<Flex justify='space-between' align='center' style={{ width: '100%' }}>
								<Text type='secondary'>X</Text>
								<NumberInput
									min={editing.position?.x > 128 ? editing.position?.x - 128 : 0}
									max={editing.position?.x + 128 < dynamicState.texture?.image?.width ? editing.position?.x + 128 : dynamicState.texture?.image?.width}
									label='X Position'
									style={{ width: '50%' }}
									preset={{
										suffix: '',
										values: [...Array.from({ length: 21 }, (_, i) => (i - 10) / 10)]
									}}
									get={editing.position?.x}
									set={(value) => {
										const newLayer = { ...editing, position: { ...editing.position, x: value } };
										setEditing(newLayer);
										setLayers((prevLayers) => {
											return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
										});
									}}
									setSliding={setAdjusting}
									onStop={() => { pushHistory(baseColor, layers.map(layer => layer.id === editing.id ? { ...layer, position: { ...layer.position, x: editing.position.x } } : layer)); }}
								/>
							</Flex>
							<Flex justify='space-between' align='center' style={{ width: '100%' }}>
								<Text type='secondary'>Y</Text>
								<NumberInput
									min={editing.position?.y > 128 ? editing.position?.y - 128 : 0}
									max={editing.position?.y + 128 < dynamicState.texture?.image?.height ? editing.position?.y + 128 : dynamicState.texture?.image?.height}
									label='Y Position'
									style={{ width: '50%' }}
									preset={{
										suffix: '',
										values: [...Array.from({ length: 21 }, (_, i) => (i - 10) / 10)]
									}}
									get={editing.position?.y}
									set={(value) => {
										const newLayer = { ...editing, position: { ...editing.position, y: value } };
										setEditing(newLayer);
										setLayers((prevLayers) => {
											return prevLayers.map(layer => layer.id === newLayer.id ? newLayer : layer);
										});
									}}
									setSliding={setAdjusting}
									onStop={() => { pushHistory(baseColor, layers.map(layer => layer.id === editing.id ? { ...layer, position: { ...layer.position, y: editing.position.y } } : layer)); }}
								/>
							</Flex>
						</Flex>
					</Flex>
				)}
				trigger='click'
			>
				<div style={{ position: 'absolute', top: '50%', right: -32 }} />
			</Popover>
			<Sheet
				isOpen={menuSheetOpen}
				onClose={() => setMenuSheetOpen(false)}

				snapPoints={[window.innerHeight, 512, 128, 0]}
				initialSnap={1}
				style={{ zIndex: 1000 }}
			>
				<Sheet.Container style={{ backgroundColor: '#1f1f1f' }}>
					<Sheet.Header />

					<Sheet.Content>
						<Flex vertical gap={16} style={{ padding: '0 32px' }}>
							<Button
								size='large'
								type='primary'
								onClick={async () => {
									setLoading(true);
									setMenuSheetOpen(false);
									const images = [];
									const positions = [
										{ x: 0, y: 2, z: 10 },
										{ x: 0, y: 2, z: -10 },
										{ x: -10, y: 2, z: 0 },
										{ x: 10, y: 2, z: 0 }
									];
									const labels = ['Front', 'Back', 'Left', 'Right'];
									for (let i = 0; i < positions.length; i++) {
										setCameraTo({
											position: positions[i],
											animated: false
										});
										await new Promise(resolve => setTimeout(resolve, 500)); // Wait for camera to settle
										dynamicState.renderer.render(dynamicState.scene, dynamicState.camera);

										const base64 = dynamicState.renderer.domElement.toDataURL('image/png');
										const cropped = await cropAlpha(base64);
										images.push({ label: labels[i], source: cropped });
									};
									setExportPreviewImages(images);
									setExportImageModalOpen(true);
									setLoading(false);

									// Reset camera to default position
									setCameraTo({
										position: { x: 0, y: 2, z: 10 },
										animated: true
									});
								}}
							>
								Export to Image
							</Button>
						</Flex>
					</Sheet.Content>
				</Sheet.Container>

				<Sheet.Backdrop onTap={() => setMenuSheetOpen(false)} />
			</Sheet>
			<PromptModal
				promptModalOpen={promptModalOpen}
				setPromptModalOpen={setPromptModalOpen}
				addAssetSource={addAssetSource}
			/>
			<ExportImageModal
				images={exportPreviewImages}
				showExportModal={exportImageModalOpen}
				setShowExportModal={setExportImageModalOpen}
			/>

			{loading && (
				<Skeleton.Node
					active
					style={{
						position: 'absolute',

						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						borderRadius: 0,
						zIndex: 2,

						maskImage: 'url(/assets/logo.png), linear-gradient(#ffffff, #ffffff)',
						maskSize: 'contain',
						maskRepeat: 'no-repeat',
						maskPosition: 'center',
						maskComposite: 'exclude'
					}}
				/>
			)}
		</Flex>
	);
};

export default Canvas;