import React from 'react';

import { Skeleton } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

/**
 * @param {{ src: string } & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>} param0
 * @returns {React.JSX.Element}
 */
const Img = ({ src, ...props }) => {
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const img = new Image();
		img.src = src;
		img.onload = () => setLoading(false);
		img.onerror = () => setLoading(false);
	}, [src]);

	const size = props.height || props.width || 128;

	return (
		<>
			{(!src || loading) ?
				<Skeleton.Image active style={{ width: props.width || size, height: props.height || size }} /> :
				<img src={src} {...props} />
			}
		</>
	);
};

export default Img;