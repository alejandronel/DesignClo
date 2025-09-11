import React from 'react';

import { Modal, Input, Checkbox, Typography, Flex, Button, App } from 'antd';

import { WarningOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

import tauriFetch from '../utils/tauriFetch';

/**
 * @param {{
 * 	prompt: String;
 * 	url: String;
 * 	tags: String[];
 * 	showPreviewModal: Boolean;
 * 	setShowPreviewModal: React.Dispatch<React.SetStateAction<Boolean>>;
 * }} props
 * @returns {React.JSX.Element}
 */
const PreviewModal = ({
	prompt,
	url,
	tags,
	showPreviewModal,
	setShowPreviewModal
}) => {
	return (
		<Modal
			open={showPreviewModal}
			closable
			maskClosable
			cancelButtonProps={{
				style: { display: 'none' }
			}}
			onOk={() => setShowPreviewModal(false)}
			onCancel={() => setShowPreviewModal(false)}
			title='Preview Asset'
			styles={{
				content: {
					padding: 32
				}
			}}
		>
			<Flex vertical justify='center' align='middle' gap={16} style={{ minHeight: 256 }}>
				<img src={url} alt='Preview' style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
				<Text type='secondary'>
					{prompt || 'No prompt provided.'}
				</Text>
				{tags && tags.length > 0 && (
					<Flex vertical gap={8} style={{ width: '100%' }}>
						<Text type='secondary'>Tags:</Text>
						<Flex wrap justify='center' gap={8} style={{ width: '100%' }}>
							{tags.map((tag, index) => (
								<Button key={index} size='small' type='default'>{tag}</Button>
							))}
						</Flex>
					</Flex>
				)}
			</Flex>
		</Modal>
	);
};

/**
 * @param {{
 * 	promptModalOpen: Boolean;
 * 	setPromptModalOpen: React.Dispatch<React.SetStateAction<Boolean>>;
 * 	addAssetSource: (assetUrl: String) => void;
 * }} props
 * @returns {React.JSX.Element}
 */
const PromptModal = ({
	promptModalOpen,
	setPromptModalOpen,
	addAssetSource = () => {}
}) => {
	const [prompting, setPrompting] = React.useState(false);
	const [prompt, setPrompt] = React.useState({
		message: '',
		removeBackground: false
	});
	const [url, setUrl] = React.useState('');
	const [tags, setTags] = React.useState([]);

	React.useEffect(() => {
		if (promptModalOpen) {
			setPrompt({ message: '', removeBackground: false });
			setUrl('');
			setTags([]);
		};
		setTimeout(() => {
			if (promptModalOpen) {
				const promptInput = document.getElementById('prompt-input');
				if (promptInput) {
					promptInput.focus();
				};
			};
		}, 500);
	}, [promptModalOpen]);

	const notification = App.useApp().notification;

	return (
		<>
			<Modal
				open={promptModalOpen}
				title='Create New Asset'
				closable={!prompting}
				maskClosable={!prompting}
				confirmLoading={prompting}
				onCancel={() => setPromptModalOpen(false)}
				onOk={async () => {
					if (!prompt.message.trim()) {
						notification.error({
							message: 'Empty Prompt',
							description: 'Please enter a prompt to create an asset.',
							style: { padding: 16 },
							closeIcon: null
						});
						return;
					};
					const formdata = new FormData();
					formdata.append('prompt', prompt.message);
					formdata.append('remove_background', prompt.removeBackground ? 'true' : 'false');
					setPrompting(true);
					try {
						const response = await tauriFetch('http://52.221.81.246/prompt', {
							method: 'POST',
							body: formdata
						});
						const result = await response.json();
						
						/**
						 * @type {{
						 *  id: String;
						 *  created_at: String;
						 *  file: String;
						 *  prompt: String;
						 *  tags: String[]
						 * }}
						 */
						const data = result;

						if (!data.file) {
							notification.error({
								message: 'Error Creating Asset',
								description: 'Failed to create asset. Please try again.',
								style: { padding: 16 },
								closeIcon: null
							});
							return;
						};

						const url = `http://52.221.81.246/file/${data.file}`;
						const blobResponse = await tauriFetch(url, {
							method: 'GET'
						});
						const blob = await blobResponse.blob();
						
						const assetUrl = URL.createObjectURL(blob);
						setUrl(assetUrl);
						setTags(data.tags || []);
						setPrompting(false);
						setPromptModalOpen(false);
						addAssetSource(assetUrl);
					} catch (error) {
						console.error('Error creating asset:', error);
						notification.error({
							message: 'Error Creating Asset',
							description: <pre>{error.message}</pre>,
							style: { padding: 16 },
							closeIcon: null
						});
						setUrl('');
						setTags([]);
						setPrompt({ message: '', removeBackground: false });
						setPrompting(false);
					};
				}}
				styles={{
					content: {
						padding: 32
					}
				}}
				okText='Create'
				okButtonProps={{
					disabled: !prompt.message?.trim(),
					loading: prompting
				}}
				cancelButtonProps={{
					disabled: prompting
				}}
			>
				<Flex vertical gap={16}>
					<Input.TextArea
						id='prompt-input'
						autoFocus
						showCount
						autoSize={{ minRows: 1, maxRows: 12 }}
						placeholder={`What\'s on your mind?`}
						maxLength={512}
						value={prompt.message}
						onChange={(e) => setPrompt({ ...prompt, message: e.target.value })}
					/>
					<Flex vertical style={{ transition: 'height var(--ant-motion-duration-slow)' }}>
						<Checkbox
							checked={prompt.removeBackground}
							onChange={(e) => setPrompt({ ...prompt, removeBackground: e.target.checked })}
						>
							<Text type='secondary'>Remove Background</Text>
						</Checkbox>
						<Paragraph
							type='warning'
							style={{
								fontSize: 12,
								maxHeight: prompt.removeBackground ? '64px' : '0px',
								overflow: 'hidden',
								transition: 'max-height var(--ant-motion-duration-slow) ease-in-out'
							}}
						>
							<WarningOutlined /> This is an experimental feature. It may not work as expected.
						</Paragraph>
					</Flex>

					<Paragraph type='secondary' style={{ fontSize: 12 }}>
						<Text type='warning'>Note:</Text> The image will be generated by an AI model and will be shared to our Global Asset Library. Please do not use any sensitive or personal information in your prompt.
					</Paragraph>
				</Flex>
			</Modal>
			<PreviewModal
				prompt={prompt.message}
				url={url}
				tags={tags}
				showPreviewModal={!!url}
				setShowPreviewModal={(show) => {
					if (!show) setUrl('');
				}}
			/>
		</>
	);
};

export default PromptModal;