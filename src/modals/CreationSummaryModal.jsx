import React from 'react';
import { Modal, Flex, Card } from 'antd';

/**
 * @param {{
 *  navigate: import('react-router').NavigateFunction;
 * 	form: import('../pages/Create').Form;
 * 	setForm: React.Dispatch<React.SetStateAction<import('../pages/Create').Form>>;
 * 	creationSummaryModalOpen: Boolean;
 * 	setCreationSummaryModalOpen: React.Dispatch<React.SetStateAction<Boolean>>;
 * }} param0
 * @returns {React.JSX.Element}
 */
const CreationSummaryModal = ({ navigate, form, setForm, creationSummaryModalOpen, setCreationSummaryModalOpen }) => {
	return (
		<Modal
			open={creationSummaryModalOpen}
			title='Creation Summary'
			closable
			maskClosable
			okText='Confirm'
			cancelText='Reset'
			onOk={() => {
				// Handle confirmation logic here, e.g., save the form or proceed to the next step
				console.log('Form confirmed:', form);
				navigate('/canvas', {
					state: { form }
				});
				setCreationSummaryModalOpen(false);
			}}
			onCancel={() => {
				setForm({
					garment: null,
					sleeve: null,
					collar: null,
					design: null
				});
				navigate('/create/garment', {
					state: { reset: true }
				});
				setCreationSummaryModalOpen(false);
			}}
			styles={{
				content: {
					padding: 32
				}
			}}
		>
			<Flex justify='center' gap={16} wrap style={{ width: '100%' }}>
				<Card
					size='small'
					cover={<img src={`/clothes/${form.garment}/garment.png`} alt='Garment' style={{ width: 128, height: 64, objectFit: 'contain' }} />}
					style={{ width: 128 }}
					onClick={() => {
						navigate('/create/garment');
						setCreationSummaryModalOpen(false);
					}}
				>
					<Card.Meta description={
						form.garment === 'polo' ? 'Polo' :
							form.garment === 'polo-shirt' ? 'Polo Shirt' :
								'T-Shirt'
					} />
				</Card>
				{form.garment !== 'polo-shirt' && (
					<Card
						size='small'
						cover={<img src={`/clothes/${form.garment}/sleeve-${form.sleeve}.png`} alt='Sleeve' style={{ width: 128, height: 64, objectFit: 'contain' }} />}
						style={{ width: 128 }}
						onClick={() => {
							navigate('/create/sleeve');
							setCreationSummaryModalOpen(false);
						}}
					>
						<Card.Meta description={
							form.sleeve === 'short' ? 'Short Sleeve' :
								form.sleeve === 'long' ? 'Long Sleeve' :
									'Oversize Sleeve'
						} />
					</Card>
				)}
				<Card
					size='small'
					cover={<img src={`/clothes/${form.garment}/collar-${form.collar}.png`} alt='Collar' style={{ width: 128, height: 64, objectFit: 'contain' }} />}
					style={{ width: 128 }}
					onClick={() => {
						navigate('/create/collar');
						setCreationSummaryModalOpen(false);
					}}
				>
					<Card.Meta description={
						form.collar === 'classic' ? 'Classic Collar' :
							form.collar === 'button-down' ? 'Button Down Collar' :
								form.collar === 'chinese' ? 'Chinese Collar' :
									form.collar === 'contrast' ? 'Contrast Collar' :
										form.collar === 'spread' ? 'Spread Collar' :
											form.collar === 'crew-neck' ? 'Crew Neck' :
												form.collar === 'ringer-neck' ? 'Ringer Neck' :
													form.collar === 'scoop-neck' ? 'Scoop Neck' :
														form.collar === 'v-neck' ? 'V Neck' :
															''
					} />
				</Card>
				<Card
					size='small'
					cover={<img src='https://picsum.photos/200' alt='Design' style={{ width: 128, height: 64, objectFit: 'cover' }} />}
					style={{ width: 128 }}
					onClick={() => {
						navigate('/create/design');
						setCreationSummaryModalOpen(false);
					}}
				>
					<Card.Meta description={
						form.design === 'street-wear' ? 'Street Wear' :
							form.design === 'graphic-tees' ? 'Graphic Tees' :
								form.design === 'minimal' ? 'Minimal' :
									form.design === 'organizational' ? 'Organizational' :
										''
					} />
				</Card>
			</Flex>
		</Modal>
	);
};
export default CreationSummaryModal;