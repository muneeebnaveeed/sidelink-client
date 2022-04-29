import { Spin } from 'antd';

const { TableSkeleton, EllipsisDropdown, SingleDropdownMenu } = require('components/shared-components');

export const indexRenderer = (isPlaceholderData, pagingCounter) => (row, elm, index) =>
	<TableSkeleton loading={isPlaceholderData}>{pagingCounter + index}</TableSkeleton>;

export const defaultRenderer = (isPlaceholderData) => {
	if (!isPlaceholderData) return null;
	return (name) => <TableSkeleton>{name}</TableSkeleton>;
};

export const customRenderer = (isPlaceholderData, node) => {
	return (value, row) => <TableSkeleton loading={isPlaceholderData}>{node(value, row)}</TableSkeleton>;
};

export const actionRenderer = (isPlaceholderData, params) => (row, elm) => {
	return (
		<TableSkeleton loading={isPlaceholderData}>
			<div className="text-right">
				{params.deletingIds?.includes(elm._id) ? (
					<Spin />
				) : (
					<EllipsisDropdown menu={<SingleDropdownMenu row={elm} onEdit={params.onEdit} onDelete={params.onDelete} />} />
				)}
			</div>
		</TableSkeleton>
	);
};

const getRenderers = (isPlaceholderData) => {
	return {
		indexRenderer: (pagingCounter) => indexRenderer(isPlaceholderData, pagingCounter),
		defaultRenderer: () => defaultRenderer(isPlaceholderData),
		customRenderer: (node) => customRenderer(isPlaceholderData, node),
		actionRenderer: ({ deletingIds, onEdit, onDelete }) =>
			actionRenderer(isPlaceholderData, { deletingIds, onEdit, onDelete }),
	};
};

export default getRenderers;
