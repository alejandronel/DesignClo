import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useRoutes, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

import { ConfigProvider, App, theme, Modal } from 'antd';

import Home from './pages/Home';
import Create from './pages/Create';
import Canvas from './pages/Canvas';

import 'antd/dist/reset.css';
import './styles/index.css';

const AnimatedRoutes = () => {
	const location = useLocation();

	const routes = useRoutes([
		{ path: '/', element: <Home /> },
		{ path: '/home', element: <Home /> },
		{ path: '/create/*', element: <Create /> },
		{ path: '/canvas', element: <Canvas /> }
	]);

	return (
		<AnimatePresence mode='wait'>
			<motion.div
				key={`/${location.pathname.split('/')[1] || ''}`}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
			>
				{routes}
			</motion.div>
		</AnimatePresence>
	);
};

const Main = () => {
	React.useEffect(() => {
		const eventHandler = (event) => {
			/**
			 * @typedef {{
			 *	destroy: () => void;
			 *	update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
			 * }} ErrorModal
			 */
			if (window.errorModal) {
				/** @type {ErrorModal} */
				const errorModal = window.errorModal;
				errorModal.update({
					content: window.errorMessage + `\n\n${event.message}`
				});
				return;
			};

			/** @type {ErrorModal} */
			const errorModal = Modal.error({
				title: 'An error occurred',
				content: event.message,
				okText: 'Reload',
				onOk: () => {
					location.reload(true);
				},
				closable: true
			});
			window.errorModal = errorModal;
			window.errorMessage = event.message;
		};
		window.addEventListener('error', eventHandler);

		return () => {
			window.removeEventListener('error', eventHandler);
			if (window.errorModal) {
				window.errorModal.destroy();
				window.errorModal = null;
				window.errorMessage = null;
			}
		};
	}, []);

	return (
		<React.StrictMode>
			<ConfigProvider
				theme={{
					algorithm: [
						theme.defaultAlgorithm,
						theme.darkAlgorithm
					],
					cssVar: true,
					token: {
						fontSize: 16,
						sizeUnit: 8,
						borderRadius: 8
					},
					components: {
						Modal: {
							padding: 32
						},
						Notification: {
							padding: 16
						}
					}
				}}
			>
				<App>
					<BrowserRouter>
						<AnimatedRoutes />
					</BrowserRouter>
				</App>
			</ConfigProvider>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);