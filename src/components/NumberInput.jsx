import React from 'react';
import { Space, Input, Button, Popover, Slider, Flex, Collapse, Typography } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * @param {{
 * 	min?: Number;
 * 	max?: Number;
 * 	step?: Number;
 * 	get: Number;
 * 	set: React.Dispatch<React.SetStateAction<Number>>;
 * 	label?: string;
 * 	preset?: { suffix: string; values: Number[] };
 * 	setSliding: React.Dispatch<React.SetStateAction<Boolean>>;
 * 	onStop?: (value: Number) => Void;
 * } & import('antd/es/space/Compact').SpaceCompactProps} props
 * @returns {React.JSX.IntrinsicElements.div}
 */
const NumberInput = ({
	min = 0,
	max = 100,
	step,
	get = 0,
	set = () => { },
	label = '',
	preset = {},
	setSliding = () => { },
	onStop = () => { },
	...props
}) => {
	const [thisAdjusting, setThisSliding] = React.useState(false);
	React.useEffect(() => {
		setSliding(thisAdjusting);
	}, [thisAdjusting, setSliding]);

	return (
		<Space.Compact
			{...props}
		>
			<Input
				controls={false}
				style={{ width: '100%', textAlign: 'center', padding: 0 }}
				onBeforeInput={(e) => {
					// Prevent non-float characters
					if (e.data === '.' && !e.target.value.endsWith('.'))
						e.target.value += '.0';
					if (isNaN(parseFloat(e.data)) && (e.data !== '-' || e.data !== '.'))
						e.preventDefault();
				}}
				min={min}
				max={max}
				step={step}
				value={get}
				onFocus={(e) => {
					setTimeout(() => {
						e.target.select();
						e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					}, 500);
				}}
				onChange={(e) => {
					// Check if the input ends with a .
					const value = parseFloat(e.target.value);
					if (!isNaN(value))
						set(Math.min(Math.max(value, min), max));
					onStop(get);
				}}
			/>
			<Popover
				placement='bottomRight'
				fresh
				styles={{
					body: { maxHeight: 256, overflowY: 'auto', opacity: thisAdjusting ? 0.75 : 1 }
				}}
				content={
					<Flex vertical style={{ width: 128 }}>
						{label && <Text strong>{label}</Text>}
						<Slider
							included={false}
							min={min}
							max={max}
							step={step}
							value={get}
							onChange={(value) => {
								set(value);
								setThisSliding(true);
							}}
							onChangeComplete={() => {
								setThisSliding(false);
								onStop(get);
							}}
						/>
						{preset.values && (
							<Collapse
								expandIconPosition='end'
								bordered={false}
								style={{ backgroundColor: 'transparent' }}
								items={[
									{
										key: '1',
										label: <Text type='secondary' style={{ fontSize: 16 }}>Presets</Text>,
										styles: {
											header: { padding: 8 },
											body: { padding: '0 4px', backgroundColor: 'transparent' }
										},
										children: (
											<Flex vertical gap={4}>
												{preset.values.map((value) => (
													<Button
														key={value}
														type='default'
														size='small'
														style={{ width: '100%', padding: 0 }}
														onClick={() => {
															set(value);
															onStop(get);
														}}
													>
														{value}{preset.suffix || ''}
													</Button>
												))}
											</Flex>
										)
									}
								]}
							/>
						)}
					</Flex>
				}
			>
				<Button
					type='default'
					icon={<EllipsisOutlined />}
					style={{ width: 32, padding: 0 }}
				/>
			</Popover>
		</Space.Compact>
	);
};

export default NumberInput;
