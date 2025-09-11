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
const Collar = ({ navigate, location, form, setForm }) => {
	const handleCollarSelect = (collar) => {
		setForm({ ...form, collar });
		navigate('/create/design');
	};
	return (
		<Flex vertical align='center' justify='space-between' className='scrollable-container' style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Title level={2}>Collar</Title>

			<Flex justify='center' gap={32} wrap style={{ width: '100%' }}>
				{form.garment === 'polo' && (
					<>
						<Card
							size='small'
							cover={<Img src='/clothes/polo/collar-classic.png' alt='Classic Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('classic')}
						>
							<Card.Meta description='Classic Collar' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo/collar-button-down.png' alt='Button Down Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('button-down')}
						>
							<Card.Meta description='Button Down Collar' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo/collar-chinese.png' alt='Chinese Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('chinese')}
						>
							<Card.Meta description='Chinese Collar' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo/collar-contrast.png' alt='Contrast Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('contrast')}
						>
							<Card.Meta description='Contrast Collar' />
						</Card>
					</>
				)}

				{form.garment === 'polo-shirt' && (
					<>
						<Card
							size='small'
							cover={<Img src='/clothes/polo-shirt/collar-classic.png' alt='Classic Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('classic')}
						>
							<Card.Meta description='Classic Collar' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo-shirt/collar-chinese.png' alt='Chinese Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('chinese')}
						>
							<Card.Meta description='Chinese Collar' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo-shirt/collar-contrast.png' alt='Contrast Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('contrast')}
						>
							<Card.Meta description='Contrast Collar' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo-shirt/collar-spread.png' alt='Spread Collar' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('spread')}
						>
							<Card.Meta description='Spread Collar' />
						</Card>
					</>
				)}

				{form.garment === 't-shirt' && (
					<>
						<Card
							size='small'
							cover={<Img src='/clothes/t-shirt/collar-crew-neck.png' alt='Crew Neck' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('crew-neck')}
						>
							<Card.Meta description='Crew Neck' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/t-shirt/collar-ringer-neck.png' alt='Ringer Neck' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('ringer-neck')}
						>
							<Card.Meta description='Ringer Neck' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/t-shirt/collar-scoop-neck.png' alt='Scoop Neck' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('scoop-neck')}
						>
							<Card.Meta description='Scoop Neck' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/t-shirt/collar-v-neck.png' alt='V Neck' />}
							style={{ width: 128 }}
							onClick={() => handleCollarSelect('v-neck')}
						>
							<Card.Meta description='V Neck' />
						</Card>
					</>
				)}
			</Flex>

			<Text type='secondary' italic style={{ textAlign: 'center' }}>
				Select the collar style of your choice.
			</Text>
		</Flex>
	);
};
export default Collar;