import React from 'react';
import { Flex, Card, Typography } from 'antd';

import Img from '../../components/Img';

const { Title, Text } = Typography;

/**
 * @param {{
 *  navigate: import('react-router').NavigateFunction,
 *  location: import('react-router').Location<any>,
 * 	form: import('../Create').Form,
 * 	setForm: React.Dispatch<React.SetStateAction<import('../Create').Form>
 * }} param0
 * @returns {React.JSX.Element}
 */
const Garment = ({ navigate, location, form, setForm }) => {
	const handleGarmentSelect = (garment) => {
		setForm({
			garment,
			sleeve: garment === 'polo-shirt' ? 'default' : null,
			collar: null,
			design: null
		});
		console.log('Garment selected:', garment);
		navigate(garment === 'polo-shirt' ?  '/create/collar' : '/create/sleeve');
	};
	return (
		<Flex vertical align='center' justify='space-between' className='scrollable-container' style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Title level={2}>Garment</Title>

			<Flex justify='center' gap={32} wrap style={{ width: '100%' }}>
				<Card
					size='small'
					cover={<Img src='/clothes/polo/garment.png' alt='Polo' />}
					style={{ width: 128 }}
					onClick={() => handleGarmentSelect('polo')}
				>
					<Card.Meta title='Polo' />
				</Card>
				<Card
					size='small'
					cover={<Img src='/clothes/polo-shirt/garment.png' alt='polo-shirt' />}
					style={{ width: 128 }}
					onClick={() => handleGarmentSelect('polo-shirt')}
				>
					<Card.Meta title='Polo Shirt' />
				</Card>
				<Card
					size='small'
					cover={<Img src='/clothes/t-shirt/garment.png' alt='t-shirt' />}
					style={{ width: 128 }}
					onClick={() => handleGarmentSelect('t-shirt')}
				>
					<Card.Meta title='T-Shirt' />
				</Card>
			</Flex>

			<Text type='secondary' italic style={{ textAlign: 'center' }}>
				Select the garment of your choice.
			</Text>
		</Flex>
	);
};
export default Garment;