import React from 'react';
import { Joystick as RNJoystick } from 'react-joystick-component';

/**
 * @param {{
 * 	size?: Number;
 * 	onMove?: (newPosition: { x: Number, y: Number }) => Void;
 * 	setMoving?: React.Dispatch<React.SetStateAction<Boolean>>;
 * 	onStop?: () => Void;
 * }} props
 * @returns {React.JSX.IntrinsicElements.div}
 */
const Joystick = ({
	size = 128,
	onMove = (newPosition) => { console.log(newPosition); },
	setMoving = (isMoving) => { console.log('Joystick moving:', isMoving); },
	onStop = () => { console.log('Joystick stopped'); }
}) => {
	const [position, setPosition] = React.useState({ x: 0, y: 0 });
	const [stickTexture, setStickTexture] = React.useState('');

	React.useEffect(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 64;
		canvas.height = 64;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		context.fillStyle = '#f1f1f1';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = '#1f1f1f';
		// Draw an diamond shape
		context.beginPath();
		context.moveTo(32, 4);
		context.lineTo(60, 32);
		context.lineTo(32, 60);
		context.lineTo(4, 32);
		context.closePath();
		context.fill();
		// Draw a white circle in the center
		context.beginPath();
		context.arc(32, 32, 16 + 4, 0, Math.PI * 2);
		context.fillStyle = '#f1f1f1';
		context.fill();
		setStickTexture(canvas.toDataURL());
	}, []);

	return (
		<RNJoystick
			size={size}
			baseColor='#1f1f1f'
			baseShape='square'
			stickColor='#f1f1f1'
			stickShape='circle'
			stickImage={stickTexture}
			stickSize={64}
			throttle={4}

			start={(e) => {
				setPosition({ x: e.x, y: e.y });
			}}
			move={(e) => {
				const newPosition = {
					x: (e.x - position.x) * size,
					y: (e.y - position.y) * size
				};
				setPosition({ x: e.x, y: e.y });
				onMove(newPosition);
				setMoving(true);
			}}
			stop={() => {
				setPosition({ x: 0, y: 0 });
				onMove({ x: 0, y: 0 });
				setMoving(false);
				onStop();
			}}
		/>
	);
};

export default Joystick;