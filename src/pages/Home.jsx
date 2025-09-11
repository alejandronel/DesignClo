import React from 'react';
import { useNavigate } from 'react-router';

import { Flex, Button, Typography, Image } from 'antd';

import { FileOutlined, PlusOutlined, SkinOutlined } from '@ant-design/icons';

const { Text } = Typography;

import Logo from '../assets/images/DesignClo-Logo.png';

const Home = () => {
	const navigate = useNavigate();

	return (
		<Flex vertical className='page-container'>
			<Flex
				align='center'
				justify='center'

				style={{
					width: '100%',
					height: '100%',
					padding: 32
				}}
			>
				<Image src={Logo} alt='Logo' preview={false} />
			</Flex>



			<Flex
				align='center'
				justify='space-around'
				gap={16}
				style={{
					width: '100%',
					padding: 32
				}}
			>
				<Button type='primary' size='large' icon={<FileOutlined />} />

				<Button
					type='primary'
					size='large'
					style={{ width: 32, height: 64 }}
					onClick={() => navigate('/create/garment')}
				>
					<Flex vertical align='center' justify='center'>
						<PlusOutlined style={{ color: 'currentcolor' }} />
						<Text style={{ color: 'currentcolor' }}>Create</Text>
					</Flex>
				</Button>

				<Button type='primary' size='large' icon={<SkinOutlined />} />
			</Flex>
		</Flex>
	);
};

export default Home;