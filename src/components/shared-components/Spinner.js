import { Spin } from 'antd';
import React from 'react';
import Flex from './Flex';

export const SpinnerContainer = ({ children }) => {
	return <div className="spinner-overlay-container">{children}</div>;
};

export const Spinner = () => {
	return (
		<Flex justifyContent="center" alignItems="center">
			<Spin />
		</Flex>
	);
};
