import { Skeleton } from 'antd';
import React from 'react';

const TableSkeleton = ({ children, loading = true }) => {
	return (
		<Skeleton loading={loading} active paragraph={false}>
			{children}
		</Skeleton>
	);
};

export default TableSkeleton;
