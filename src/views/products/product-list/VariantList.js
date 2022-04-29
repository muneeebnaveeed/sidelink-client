import { message, Spin, Table } from 'antd';
import { EllipsisDropdown, SingleDropdownMenu } from 'components/shared-components';
import React, { useCallback, useState } from 'react';
import NumberFormat from 'react-number-format';
import { useMutation, useQueryClient } from 'react-query';
import Utils from 'utils';
import { del } from 'utils/server';
import getRenderers from 'utils/tableRenderers';

const variantActionRenderer =
	({ deletingIds, ...params }) =>
	(row, elm) => {
		return (
			<div className="text-right">
				{deletingIds?.includes(elm._id) ? (
					<Spin />
				) : (
					<EllipsisDropdown menu={<SingleDropdownMenu row={elm} {...params} />} />
				)}
			</div>
		);
	};

const getExpandedTableColumns = ({ isPlaceholderData, deletingIds, onEdit, onDelete, canDelete }) => {
	const { defaultRenderer, customRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 76,
		},
		{
			title: 'Variant',
			dataIndex: 'name',
			render: defaultRenderer(),
		},
		{
			title: 'SKU',
			dataIndex: 'sku',
			render: defaultRenderer(),
		},
		{
			title: 'Price',
			dataIndex: 'price',
			sorter: (a, b) => Utils.antdTableSorter(a, b, 'price'),
			render: customRenderer((price) => (
				<div>
					<NumberFormat
						displayType={'text'}
						value={price}
						prefix={'PKR '}
						thousandSeparator
						thousandsGroupStyle={'lakh'}
					/>
				</div>
			)),
		},
		{
			fixed: 'right',
			width: 150,
			render: variantActionRenderer({ deletingIds, onEdit, onDelete, canDelete }),
		},
	];
};

const useVariantList = ({ modalData, toggleModal }) => {
	const [variantDeletingIds, setVariantDeletingIds] = useState([]);

	const queryClient = useQueryClient();

	const deleteVariantMutation = useMutation((payload) => del(`/product_variants/id/${payload}`), {
		onSuccess: (response, payload) => {
			const ids = payload.split(',');
			setVariantDeletingIds((prev) => prev.filter((id) => !ids.includes(id)));
			message.success('Product variant has been deleted successfully');
			queryClient.invalidateQueries('products');
		},
		onError: (error, payload) => {
			message.error(Utils.getErrorMessages(error));
		},
		onSettled: (data, error, payload) => {
			const ids = payload.split(',');
			Utils.unshiftIds(setVariantDeletingIds, ids);
		},
	});

	const handleEditVariant = useCallback(
		(product) => (variant) => {
			modalData.set({ product, variant });
			toggleModal();
		},
		[modalData, toggleModal]
	);

	const handleDeleteVariant = useCallback(
		(variant) => {
			var confirm = window.confirm('Are you sure to delete the variant?');
			if (!confirm) return;

			const id = variant._id;
			deleteVariantMutation.mutate(id);
			setVariantDeletingIds((prev) => [...prev, id]);
		},
		[deleteVariantMutation]
	);

	const getExpandedTableProps = useCallback(
		(row, isPlaceholderData) => {
			return {
				dataSource: row.variants,
				pagination: false,
				columns: getExpandedTableColumns({
					isPlaceholderData,
					deletingIds: variantDeletingIds,
					onEdit: handleEditVariant(row),
					onDelete: handleDeleteVariant,
					canDelete: row.variants.length - variantDeletingIds.length > 1,
				}),
			};
		},
		[handleDeleteVariant, handleEditVariant, variantDeletingIds]
	);

	return (isPlaceholderData) => (row) => <Table {...getExpandedTableProps(row, isPlaceholderData)} />;
};

export default useVariantList;
