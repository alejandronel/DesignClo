import React from 'react';
import { useNavigate, Routes, Route, useLocation, useRoutes } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

import { Flex, Space, Button, Typography, Modal } from 'antd';
import Icon, { LeftOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons';

import GarmentIcon from '../assets/icons/GarmentIcon';
import SleeveIcon from '../assets/icons/SleeveIcon';
import CollarIcon from '../assets/icons/CollarIcon';
import DesignIcon from '../assets/icons/DesignIcon';

const { Text } = Typography;

import Garment from './create/Garment';
import Sleeve from './create/Sleeve';
import CollarPage from './create/Collar';
import DesignPage from './create/DesignMotif';

import CreationSummaryModal from '../modals/CreationSummaryModal';

/**
 * @typedef {{
 *	destroy: () => void;
 *	update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
 * }} CreationSummaryModal
 */

/**
 * @typedef {{
 * 	garment: 'polo',
 * 	sleeve: 'short' | 'long' | null,
 * 	collar: null,
 * 	design: 'street-wear' | 'graphic-tees' | null
 * }} FormPolo
 */
/**
 * @typedef {{
 * 	garment: 'polo-shirt',
 * 	sleeve: null,
 * 	collar: 'classic' | 'chinese' | 'contrast' | 'spread' | null,
 * 	design: 'street-wear' | 'graphic-tees' | null
 * }} FormPoloShirt
 */
/**
 * @typedef {{
 * 	garment: 't-shirt',
 * 	sleeve: 'short' | 'long' | null,
 * 	collar: 'crew-neck' | 'ringer-neck' | 'scoop-neck' | 'v-neck' | null,
 * 	design: 'minimal' | 'organizational' | null
 * }} FormTShirt
 */

/** @typedef {FormPolo | FormPoloShirt | FormTShirt} Form */

const Create = () => {
	const navigate = useNavigate();
	const location = useLocation();

	/** @type {[Form, React.Dispatch<React.SetStateAction<Form>>]} */
	const [form, setForm] = React.useState({
		garment: useLocation().state?.form?.garment,
		sleeve: useLocation().state?.form?.sleeve,
		collar: useLocation().state?.form?.collar,
		design: useLocation().state?.form?.design
	});

	const props = {
		navigate,
		location,
		form,
		setForm
	};

	const routes = useRoutes([
		{ path: '/', element: <Garment {...props} /> },
		{ path: 'garment', element: <Garment {...props} /> },
		{ path: 'sleeve', element: <Sleeve {...props} /> },
		{ path: 'collar', element: <CollarPage {...props} /> },
		{ path: 'design', element: <DesignPage {...props} /> }
	]);

	const subRouteKey = location.pathname.split('/').pop() || 'garment';

	const [creationSummaryModalOpen, setCreationSummaryModalOpen] = React.useState(false);
	React.useEffect(() => {
		if (form.garment && form.sleeve && form.collar && form.design)
			setCreationSummaryModalOpen(true);
	}, [form]);

	React.useEffect(() => {
		const androidBackCallback = () => {
			console.log('Android back button pressed');
			if (creationSummaryModalOpen) {
				setCreationSummaryModalOpen(false);
				return;
			};
			navigate(-1);
		};
		window.androidBackCallback = androidBackCallback;
		return () => {
			if (window.androidBackCallback === androidBackCallback)
				window.androidBackCallback = null;
		};
	}, []);

	return (
		<Flex vertical className='page-container'>
			{/************************************** Header **************************************/}
			<Flex
				align='center'
				justify='flex-start'
				gap={16}
				style={{ width: '100%', padding: '16px 32px' }}
			>
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate('/')}
				/>
			</Flex>



			{/************************************** Content **************************************/}
			<Flex
				align='center'
				justify='center'

				style={{ width: '100%', height: '100%' }}
			>
				<AnimatePresence mode='wait'>
					<motion.div
						key={subRouteKey}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						style={{ position: 'relative', width: '100%', height: '100%' }}
					>
						{routes}
					</motion.div>
				</AnimatePresence>
			</Flex>



			{/************************************** Navigation **************************************/}
			<Flex
				align='center'
				justify='space-between'
				style={{ width: '100%', padding: '16px 32px' }}
			>
				<Space.Compact style={{ width: '100%' }}>
					<Button
						type={subRouteKey === 'garment' ? 'primary' : 'default'}
						size='large'
						style={{ flex: 1 }}
						icon={
							<Flex vertical align='center' justify='center'>
								<Icon component={GarmentIcon} />
								<Text style={{ color: 'currentcolor', fontSize: 12 }}>Garment</Text>
							</Flex>
						}
						onClick={() => navigate('/create/garment')}
					/>
					<Button
						type={subRouteKey === 'sleeve' ? 'primary' : 'default'}
						size='large'
						disabled={!form.garment || (form.garment === 'polo-shirt')}
						style={{ flex: 1 }}
						icon={
							<Flex vertical align='center' justify='center'>
								<Icon component={SleeveIcon} />
								<Text style={{ color: 'currentcolor', fontSize: 12 }}>Sleeve</Text>
							</Flex>
						}
						onClick={() => navigate('/create/sleeve')}
					/>
					<Button
						type={subRouteKey === 'collar' ? 'primary' : 'default'}
						size='large'
						disabled={!form.sleeve}
						style={{ flex: 1 }}
						icon={
							<Flex vertical align='center' justify='center'>
								<Icon component={CollarIcon} />
								<Text style={{ color: 'currentcolor', fontSize: 12 }}>Collar</Text>
							</Flex>
						}
						onClick={() => navigate('/create/collar')}
					/>
					<Button
						type={subRouteKey === 'design' ? 'primary' : 'default'}
						size='large'
						disabled={!form.collar}
						style={{ flex: 1 }}
						icon={
							<Flex vertical align='center' justify='center'>
								<Icon component={DesignIcon} />
								<Text style={{ color: 'currentcolor', fontSize: 12 }}>Design</Text>
							</Flex>
						}
						onClick={() => navigate('/create/design')}
					/>
				</Space.Compact>
			</Flex>

			{/************************************** Modals **************************************/}
			<CreationSummaryModal
				navigate={navigate}
				form={form}
				setForm={setForm}
				creationSummaryModalOpen={creationSummaryModalOpen}
				setCreationSummaryModalOpen={setCreationSummaryModalOpen}
			/>
		</Flex>
	);
};

export default Create;