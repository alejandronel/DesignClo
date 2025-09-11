import React from 'react';

import { Modal, Typography, Flex, Card, Badge, App } from 'antd';

import { WarningOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ExportImageModal = ({
	images,
	showExportModal,
	setShowExportModal
}) => {
	const [selectedImages, setSelectedImages] = React.useState([]);
	React.useEffect(() => {
		setSelectedImages(images.map(image => ({ ...image, selected: false })));
	}, [images]);

	const notification = App.useApp().notification;

	return (
		<Modal
			open={showExportModal}
			closable
			maskClosable
			cancelButtonProps={{ style: { display: 'none' } }}
			onOk={() => {
				for (const image of selectedImages) {
					if (image.selected) {
						AndroidInterface.saveImage(`designClo-${image.label}-${Date.now()}.png`, image.source);
					};
				};
				setShowExportModal(false);
				notification.success({
					message: 'Export Successful',
					description: 'Selected images have been exported successfully.',
					duration: 3,
					style: { padding: 16 },
					closeIcon: null
				});
			}}
			onCancel={() => setShowExportModal(false)}
			title='Export to Image'
			styles={{
				content: {
					padding: 32
				}
			}}
			okText={
				<Flex align='center' gap={4}>Export <Text style={{ fontSize: 12 }}>{selectedImages.filter(img => img.selected).length}/{selectedImages.length}</Text></Flex>
			}
			okButtonProps={{
				disabled: selectedImages.filter(img => img.selected).length === 0
			}}
			footer={(_, { OkBtn, CancelBtn }) => (
				<Flex justify='flex-end' align='center' gap={8}>
					<Text type='secondary' style={{ fontSize: 12 }}>
						Select images to export
					</Text>
					<OkBtn />
				</Flex>
			)}
		>
			<Flex wrap justify='center' align='middle' gap={16} style={{ minHeight: 256 }}>
				{images.length > 0 ? (
					selectedImages.map((image, index) => (
						<Badge key={index} count={image.selected ? <CheckCircleFilled style={{ color: 'green' }} /> : 0} onClick={() => {
							const newImages = [...selectedImages];
							newImages[index].selected = !newImages[index].selected;
							setSelectedImages(newImages);
						}}>
							<Card
								size='small'
								cover={<img src={image.source} alt={image.label} style={{ width: '100%', height: 128, objectFit: 'contain' }} />}
								style={{ width: 128 }}
								styles={{
									cover: {
										padding: 8
									}
								}}
							>
								<Card.Meta description={image.label} />
							</Card>
						</Badge>
					))
				) : (
					<Flex vertical justify='center' align='middle' gap={8}>
						<WarningOutlined style={{ fontSize: 24, color: 'yellow' }} />
						<Text type='secondary'>No images to export.</Text>
					</Flex>
				)}
			</Flex>
		</Modal>
	);
};

export default ExportImageModal;