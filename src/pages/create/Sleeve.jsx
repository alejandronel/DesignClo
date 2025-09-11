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
const Sleeve = ({ navigate, location, form, setForm }) => {
	React.useEffect(() => {
		if (!form.garment) {
			navigate('/create/garment');
			return;
		};
		if (form.garment === 'polo-shirt') {
			setForm({ ...form, sleeve: 'default' });
			navigate('/create/collar');
			return;
		};
	}, [form.garment]);
	const handleSleeveSelect = (sleeve) => {
		setForm({ ...form, sleeve });
		navigate('/create/collar');
	};
	return (
		<Flex vertical align='center' justify='space-between' className='scrollable-container' style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Title level={2}>Sleeve</Title>

			<Flex justify='center' gap={32} wrap style={{ width: '100%' }}>
				{form.garment === 'polo' && (
					<>
						<Card
							size='small'
							cover={<Img src='/clothes/polo/sleeve-short.png' alt='Short Sleeve' />}
							style={{ width: 128 }}
							onClick={() => handleSleeveSelect('short')}
						>
							<Card.Meta description='Short Sleeve' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo/sleeve-long.png' alt='Long Sleeve' />}
							style={{ width: 128 }}
							onClick={() => handleSleeveSelect('long')}
						>
							<Card.Meta description='Long Sleeve' />
						</Card>
					</>
				)}

				{form.garment === 'polo-shirt' && (
					<>
						<Card
							size='small'
							cover={<Img src='/clothes/polo-shirt/sleeve-short.png' alt='Short Sleeve' />}
							style={{ width: 128 }}
							onClick={() => handleSleeveSelect('short')}
						>
							<Card.Meta description='Short Sleeve' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/polo-shirt/sleeve-oversize.png' alt='Oversize Sleeve' />}
							style={{ width: 128 }}
							onClick={() => handleSleeveSelect('oversize')}
						>
							<Card.Meta description='Oversize Sleeve' />
						</Card>
					</>
				)}

				{form.garment === 't-shirt' && (
					<>
						<Card
							size='small'
							cover={<Img src='/clothes/t-shirt/sleeve-short.png' alt='Short Sleeve' />}
							style={{ width: 128 }}
							onClick={() => handleSleeveSelect('short')}
						>
							<Card.Meta description='Short Sleeve' />
						</Card>
						<Card
							size='small'
							cover={<Img src='/clothes/t-shirt/sleeve-oversize.png' alt='Oversize Sleeve' />}
							style={{ width: 128 }}
							onClick={() => handleSleeveSelect('oversize')}
						>
							<Card.Meta description='Oversize Sleeve' />
						</Card>
					</>
				)}
			</Flex>

			<Text type='secondary' italic style={{ textAlign: 'center' }}>
				Select the sleeve style of your choice.
			</Text>
		</Flex>
	);
};
export default Sleeve;