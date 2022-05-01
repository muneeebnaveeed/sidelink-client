import { Button, message, Space, Spin, Table, Typography } from 'antd';
import { EllipsisDropdown, Flex, SingleDropdownMenu } from 'components/shared-components';
import React, { useCallback, useMemo, useState } from 'react';
import NumberFormat from 'react-number-format';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Utils from 'utils';
import { del, get } from 'utils/server';
import getRenderers from 'utils/tableRenderers';
import { EditOutlined } from '@ant-design/icons';
import PLACEHOLDER_DATA from 'utils/data';

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

const getExpandedTableColumns = ({ isPlaceholderData }) => {
	const { defaultRenderer, priceRenderer, customRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 138,
		},
		{
			title: 'Variant',
			dataIndex: ['productVariant', 'name'],
			render: customRenderer((name, variant) => {
				console.log(variant);
				return (
					<Flex flexDirection="column">
						<Typography.Text strong>{`${name} (${variant.productVariant.product.name})`}</Typography.Text>
						<Typography.Text type="secondary">{variant.productVariant.sku}</Typography.Text>
					</Flex>
				);
			}),
		},
		{
			title: 'Price',
			dataIndex: ['productVariant', 'price'],
			render: priceRenderer(),
			sorter: (a, b) => a.productVariant.price - b.productVariant.price,
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			render: defaultRenderer(),
			sorter: (a, b) => Utils.antdTableSorter(a, b, 'quantity'),
		},
		{
			title: 'Total',
			render: customRenderer((elm, row) => (
				<div>
					<NumberFormat
						displayType={'text'}
						value={row.productVariant.price * row.quantity}
						prefix={'PKR '}
						thousandSeparator
						thousandsGroupStyle={'lakh'}
					/>
				</div>
			)),

			sorter: (a, b) => a.productVariant.price - b.productVariant.price,
		},
		// {
		// 	fixed: 'right',
		// 	width: 150,
		// 	render: variantActionRenderer({ deletingIds, onEdit, onAddOneStock, onConsumeOneStock }),
		// },
	];
};

const useVariantList = ({ modalData, toggleModal, expandedProduct }) => {
	const [variantDeletingIds, setVariantDeletingIds] = useState([]);

	const queryClient = useQueryClient();

	const query = useQuery(
		['products-of-transaction', expandedProduct.value?._id],
		() => get(`/${expandedProduct.value?.type.toLowerCase()}s/id/${expandedProduct.value?._id}/products`),
		{ enabled: Boolean(expandedProduct.value?._id), placeholderData: PLACEHOLDER_DATA.PRODUCT_VARIANTS }
	);

	const tableProps = useMemo(() => {
		return {
			dataSource: query.data,
			pagination: false,
			columns: getExpandedTableColumns({
				isPlaceholderData: query.isLoading || query.isFetching || query.isPlaceholderData,
			}),
		};
	}, [query.data, query.isFetching, query.isLoading, query.isPlaceholderData]);

	return (row) => {
		return <Table {...tableProps} />;
	};
};

export default useVariantList;
