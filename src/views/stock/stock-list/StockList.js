import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Button, message, Dropdown, Space, Spin, Result, Typography } from 'antd';
import { DownOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
	AnimatedWrapper,
	BulkActionDropdownMenu,
	EllipsisDropdown,
	Flex,
	SingleDropdownMenu,
	TableSkeleton,
} from 'components/shared-components';

import { useHistory, useLocation } from 'react-router-dom';
import Utils, { useTableUtility } from 'utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { del, get } from 'utils/server';
import AddStock from './AddStock.modal';
import { useDidMount, useKey, useToggle } from 'rooks';
import { When } from 'react-if';
import getRenderers from 'utils/tableRenderers';
import PLACEHOLDER_DATA from 'utils/data';
import useVariantList from './VariantList';

const productActionRenderer = (isPlaceholderData, params) => (row, elm) => {
	return (
		<TableSkeleton loading={isPlaceholderData}>
			<div className="text-right">
				{params.deletingIds?.includes(elm._id) ? (
					<Spin />
				) : (
					<Space>
						<Flex>
							<Button type="link" onClick={() => params.onAddOneStock(elm)}>
								Add
							</Button>
							<Button type="link" onClick={() => params.onConsumeOneStock(elm)}>
								Consume
							</Button>
						</Flex>
						<EllipsisDropdown
							menu={<SingleDropdownMenu row={elm} onEdit={params.onEdit} onDelete={params.onDelete} />}
						/>
					</Space>
				)}
			</div>
		</TableSkeleton>
	);
};

const getTableColumns = ({
	pagingCounter,
	onEdit,
	onDelete,
	deletingIds,
	isPlaceholderData,
	onAddOneStock,
	onConsumeOneStock,
}) => {
	const { indexRenderer, customRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 0,
			title: '#',
			render: indexRenderer(pagingCounter),
		},
		{
			title: 'Product',
			dataIndex: ['product', 'name'],
			render: customRenderer((name, row) => {
				return (
					<Flex flexDirection="column">
						<Typography.Text strong>{row.product.name}</Typography.Text>
						<Typography.Text type="secondary">{row.variants.length} VARIANTS</Typography.Text>
					</Flex>
				);
			}),
		},
		{
			width: 150,
			render: productActionRenderer(isPlaceholderData, {
				deletingIds,
				onEdit,
				onDelete,
				onAddOneStock,
				onConsumeOneStock,
			}),
		},
	];
};

const StockList = () => {
	const history = useHistory();
	const location = useLocation();
	const queryClient = useQueryClient();
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [deletingIds, setDeletingIds] = useState([]);
	const [expandedProduct, setExpandedProduct] = useState(null);

	const { page, limit, sort, search } = useTableUtility();

	const [isModal, toggleModal] = useToggle();
	const [modalData, setModalData] = useState(null);

	const renderVariantList = useVariantList({
		modalData: { value: modalData, set: setModalData },
		expandedProduct: { value: expandedProduct, set: setExpandedProduct },
		toggleModal,
	});

	const apiParams = useMemo(
		() => ({ page: page.value, limit: limit.value, sort: sort.value, search: search.debounced }),
		[limit.value, page.value, search.debounced, sort.value]
	);

	const query = useQuery(
		['stock', apiParams],
		() =>
			get('/stock', {
				params: apiParams,
			}),
		{ placeholderData: PLACEHOLDER_DATA.STOCK }
	);

	const deleteProductMutation = useMutation((payload) => del(`/stock/id/${payload}`), {
		onSuccess: () => {
			message.success('Stock has been deleted successfully');
			queryClient.invalidateQueries('stock');
		},
		onError: (error) => {
			message.error(Utils.getErrorMessages(error));
		},
		onSettled: (data, error, payload) => {
			const ids = payload.split(',');
			Utils.unshiftIds(setSelectedRowKeys, ids);
			Utils.unshiftIds(setDeletingIds, ids);
		},
	});

	const deleteAllMutation = useMutation(() => del(`/stock/all`), {
		onSuccess: () => {
			message.success('Stock has been deleted successfully');
			queryClient.invalidateQueries('stock');
		},
		onError: (error) => {
			message.error(Utils.getErrorMessages(error));
		},
		onSettled: () => {
			setSelectedRowKeys([]);
			setDeletingIds([]);
		},
	});

	const handleAddStock = useCallback(() => {
		if (!isModal) history.push(`/app/stock/manage`);
	}, [history, isModal]);

	const handleEdit = useCallback(
		(row) => {
			history.push('/app/stock/manage', { ...row, isEditing: true });
		},
		[history]
	);

	const handleAddOneStock = useCallback(
		(row) => {
			history.push('/app/stock/manage', row);
		},
		[history]
	);

	const handleConsumeOneStock = useCallback(
		(row) => {
			history.push('/app/stock/manage', { ...row, isConsuming: true });
		},
		[history]
	);

	const handleBulkDelete = useCallback(() => {
		var confirm = window.confirm(`Are you sure you want to delete selected stock?`);
		if (!confirm) return;

		const ids = selectedRowKeys.join(',');
		deleteProductMutation.mutate(ids);
		setDeletingIds([...selectedRowKeys]);
	}, [deleteProductMutation, selectedRowKeys]);

	const handleDeleteAll = useCallback(() => {
		var confirm = window.confirm(`Are you sure you want to delete all stock?`);
		if (!confirm) return;
		deleteAllMutation.mutate();
	}, [deleteAllMutation]);

	const handleDelete = useCallback(
		(row) => {
			var confirm = window.confirm('Are you sure to delete the stock?');
			if (!confirm) return;

			const id = row._id;
			deleteProductMutation.mutate(id);
			setDeletingIds((prev) => [...prev, id]);
		},
		[deleteProductMutation]
	);

	const onSearch = useCallback(
		(e) => {
			const value = e.currentTarget.value;
			search.set(value);
			setSelectedRowKeys([]);
		},
		[search]
	);

	const handleChangePagination = useCallback(
		(p, pageSize) => {
			page.set(p);
			limit.set(pageSize);
		},
		[limit, page]
	);

	const tablePagination = useMemo(
		() => ({
			pageSize: limit.value,
			responsive: true,
			showLessItems: true,
			showSizeChanger: true,
			total: query?.data?.totalDocs,
			onChange: handleChangePagination,
		}),
		[handleChangePagination, limit.value, query?.data?.totalDocs]
	);

	const getCheckboxProps = useCallback(
		(row) => ({
			disabled: deletingIds.includes(row._id) || query.isPlaceholderData,
			name: row.name,
		}),
		[deletingIds, query.isPlaceholderData]
	);

	const tableRowSelection = useMemo(
		() => ({
			selectedRowKeys,
			type: 'checkbox',
			preserveSelectedRowKeys: false,
			onChange: setSelectedRowKeys,
			getCheckboxProps,
		}),
		[getCheckboxProps, selectedRowKeys]
	);

	const handleExpandProduct = (expanded, row) => {
		if (expanded) setExpandedProduct(row);
		else setExpandedProduct(null);
	};

	const getExpandedRowKeys = useCallback(() => {
		const expandedProductId = expandedProduct?._id;
		return expandedProductId ? [expandedProductId] : [];
	}, [expandedProduct?._id]);

	const tableExpandable = useMemo(
		() => ({
			expandedRowRender: renderVariantList(query.isPlaceholderData),
			onExpand: handleExpandProduct,
			rowExpandable: () => !query.isPlaceholderData,
			expandedRowKeys: getExpandedRowKeys(),
		}),
		[renderVariantList, query.isPlaceholderData, getExpandedRowKeys]
	);

	const tableProps = useMemo(
		() => ({
			rowKey: '_id',
			loading: query.isLoading || deleteProductMutation.isLoading,
			pagination: tablePagination,
			dataSource: query.data?.docs,
			rowSelection: tableRowSelection,
			onChange: Utils.handleChangeSort(sort.set),
			expandable: tableExpandable,
			columns: getTableColumns({
				pagingCounter: query.data?.pagingCounter,
				onEdit: handleEdit,
				onDelete: handleDelete,
				onAddOneStock: handleAddOneStock,
				onConsumeOneStock: handleConsumeOneStock,
				deletingIds,
				isPlaceholderData: query.isPlaceholderData,
			}),
		}),
		[
			deleteProductMutation.isLoading,
			deletingIds,
			handleAddOneStock,
			handleConsumeOneStock,
			handleDelete,
			handleEdit,
			query.data?.docs,
			query.data?.pagingCounter,
			query.isLoading,
			query.isPlaceholderData,
			sort.set,
			tableExpandable,
			tablePagination,
			tableRowSelection,
		]
	);

	useDidMount(() => {
		Utils.showFlashMessage(history, location, message);
	});

	useEffect(Utils.scrollToTop, [page, limit]);

	useKey(['Enter'], handleAddStock);

	useEffect(() => {
		if (query.data?.hasNextPage) {
			const apiParams = { page: page.value + 1, limit: limit.value, search: search.debounced, sort: sort.value };
			queryClient.prefetchQuery(['stock', apiParams], () => get('/stock', { params: apiParams }));
		}
	}, [query.data, page, limit.value, sort.value, search.debounced, queryClient]);

	return (
		<>
			<AnimatedWrapper>
				<Card>
					<Flex alignItems="center" justifyContent="between" mobileFlex={false}>
						<Flex className="mb-1" mobileFlex={false}>
							<When condition={query.isSuccess}>
								<Input placeholder="Search" prefix={<SearchOutlined />} onChange={onSearch} />
							</When>
						</Flex>
						<Flex>
							<Space>
								<Dropdown
									overlay={
										<BulkActionDropdownMenu
											onDelete={handleBulkDelete}
											canDelete={selectedRowKeys.length && !deleteAllMutation.isLoading}
											onDeleteAll={handleDeleteAll}
											canDeleteAll={query.data?.docs.length && !selectedRowKeys.length && !deletingIds.length}
										/>
									}
									trigger={['click']}
								>
									<Button type="secondary">
										Bulk <DownOutlined />
									</Button>
								</Dropdown>
								<Button onClick={handleAddStock} type="primary" icon={<PlusCircleOutlined />} block>
									Add Stock
								</Button>
							</Space>
						</Flex>
					</Flex>
					<When condition={query.isError}>
						<Result
							status={500}
							title="Oops.. We're having trouble fetching stock!"
							subTitle={Utils.getErrorMessages(query.error)}
							extra={
								<Button type="danger" onClick={query.refetch}>
									Try again
								</Button>
							}
						/>
					</When>
					<When condition={query.isSuccess}>
						<div className="table-responsive">
							<Table {...tableProps} />
						</div>
					</When>
				</Card>
			</AnimatedWrapper>
			<AddStock visible={{ set: toggleModal, value: isModal }} data={{ set: setModalData, value: modalData }} />
		</>
	);
};

export default StockList;
