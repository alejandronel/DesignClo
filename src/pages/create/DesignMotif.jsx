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
const DesignMotif = ({ navigate, location, form, setForm }) => {
	const handleDesignSelect = (design) => {
		setForm({ ...form, design });
	};
	return (
		<Flex vertical align='center' justify='space-between' className='scrollable-container' style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Title level={2}>Design Motifs</Title>

			<Flex justify='center' gap={32} wrap style={{ width: '100%' }}>
				{form.garment === 'polo' && (
					<>
						<Card
							size='small'
							cover={<Img src='https://picsum.photos/200' alt='Street Wear' width={256} height={128} />}
							style={{ width: 256 }}
							onClick={() => handleDesignSelect('street-wear')}
						>
							<Title level={5}>Street Wear</Title>
						</Card>
						<Card
							size='small'
							cover={<Img src='https://picsum.photos/201' alt='Graphic Tees' width={256} height={128} />}
							style={{ width: 256 }}
							onClick={() => handleDesignSelect('graphic-tees')}
						>
							<Title level={5}>Graphic Tees</Title>
						</Card>
					</>
				)}

				{form.garment === 'polo-shirt' && (
					<>
						<Card
							size='small'
							cover={<Img src='https://picsum.photos/202' alt='Street Wear' width={256} height={128} />}
							style={{ width: 256 }}
							onClick={() => handleDesignSelect('street-wear')}
						>
							<Title level={5}>Street Wear</Title>
						</Card>
						<Card
							size='small'
							cover={<Img src='https://picsum.photos/203' alt='Graphic Tees' width={256} height={128} />}
							style={{ width: 256 }}
							onClick={() => handleDesignSelect('graphic-tees')}
						>
							<Title level={5}>Graphic Tees</Title>
						</Card>
					</>
				)}

				{form.garment === 't-shirt' && (
					<>
						<Card
							size='small'
							cover={<Img src='https://picsum.photos/204' alt='Minimal' width={256} height={128} />}
							style={{ width: 256 }}
							onClick={() => handleDesignSelect('minimal')}
						>
							<Title level={5}>Minimal</Title>
						</Card>
						<Card
							size='small'
							cover={<Img src='https://picsum.photos/205' alt='Organizational' width={256} height={128} />}
							style={{ width: 256 }}
							onClick={() => handleDesignSelect('organizational')}
						>
							<Title level={5}>Organizational</Title>
						</Card>
					</>
				)}
			</Flex>

			<Text type='secondary' italic style={{ textAlign: 'center' }}>
				Select the design style of your choice.
			</Text>
		</Flex>
	);
};
export default DesignMotif;