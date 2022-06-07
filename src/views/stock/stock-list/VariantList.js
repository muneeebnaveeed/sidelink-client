import { Button, message, Space, Spin, Table } from 'antd';
import { AnimatedExpandedWrapper, EllipsisDropdown, SingleDropdownMenu } from 'components/shared-components';
import React, { useCallback, useState } from 'react';
import NumberFormat from 'react-number-format';
import { useMutation, useQueryClient } from 'react-query';
import Utils from 'utils';
import { del } from 'utils/server';
import getRenderers from 'utils/tableRenderers';
import { EditOutlined } from '@ant-design/icons';

const variantActionRenderer =
	({ deletingIds, ...params }) =>
	(row, elm) => {
		return (
			<div className="text-right">
				{deletingIds?.includes(elm._id) ? (
					<Spin />
				) : (
					<Space>
						<Button type="link" onClick={() => params.onAddOneStock(elm)}>
							Add
						</Button>
						<Button type="link" onClick={() => params.onConsumeOneStock(elm)}>
							Consume
						</Button>
						<Button shape="round" type="link" onClick={() => params.onEdit(elm)}>
							<EditOutlined />
						</Button>
					</Space>
				)}
			</div>
		);
	};

const getExpandedTableColumns = ({ isPlaceholderData, deletingIds, onEdit, onAddOneStock, onConsumeOneStock }) => {
	const { defaultRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 76,
		},
		{
			title: 'Variant',
			dataIndex: ['productVariant', 'name'],
			render: defaultRenderer(),
		},
		{
			title: 'SKU',
			dataIndex: ['productVariant', 'sku'],
			render: defaultRenderer(),
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			render: defaultRenderer(),
			sorter: (a, b) => Utils.antdTableSorter(a, b, 'quantity'),
		},
		{
			fixed: 'right',
			width: 150,
			render: variantActionRenderer({ deletingIds, onEdit, onAddOneStock, onConsumeOneStock }),
		},
	];
};

const useVariantList = ({ modalData, toggleModal, expandedProduct }) => {
	const [variantDeletingIds, setVariantDeletingIds] = useState([]);

	const queryClient = useQueryClient();

	const handleEditOneStock = useCallback(
		(product) => (stock) => {
			const editingState = { product: product.product, stock, isEditing: true };
			modalData.set(editingState);
			toggleModal();
		},
		[modalData, toggleModal]
	);

	const handleAddOneStock = useCallback(
		(row) => {
			const editingState = { product: expandedProduct.value?.product, stock: row };
			modalData.set(editingState);
			toggleModal();
		},
		[expandedProduct.value?.product, modalData, toggleModal]
	);

	const handleConsumeOneStock = useCallback(
		(row) => {
			const editingState = { product: expandedProduct.value?.product, stock: row, isConsuming: true };
			modalData.set(editingState);
			toggleModal();
		},
		[expandedProduct.value?.product, modalData, toggleModal]
	);

	const getExpandedTableProps = useCallback(
		(row, isPlaceholderData) => {
			return {
				dataSource: row.variants,
				pagination: false,
				columns: getExpandedTableColumns({
					isPlaceholderData,
					deletingIds: variantDeletingIds,
					onEdit: handleEditOneStock(row),
					onAddOneStock: handleAddOneStock,
					onConsumeOneStock: handleConsumeOneStock,
				}),
			};
		},
		[handleAddOneStock, handleEditOneStock, variantDeletingIds]
	);

	return (isPlaceholderData) => (row) =>
		(
			<AnimatedExpandedWrapper isExpanded={row._id === expandedProduct.value?._id}>
				<Table {...getExpandedTableProps(row, isPlaceholderData)} />
			</AnimatedExpandedWrapper>
		);
};

export default useVariantList;
