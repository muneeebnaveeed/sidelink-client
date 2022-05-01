import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Button, message, Dropdown, Space, Spin, Result, Typography, Menu } from 'antd';
import { DownOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
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
			title: 'Supplier',
			dataIndex: ['supplier', 'name'],
			// render: customRenderer((name, row) => {
			// 	return (
			// 		<Flex flexDirection="column">
			// 			<Typography.Text strong>{row.product.name}</Typography.Text>
			// 			<Typography.Text type="secondary">{row.variants.length} VARIANTS</Typography.Text>
			// 		</Flex>
			// 	);
			// }),
		},
		// {
		// 	width: 150,
		// 	render: productActionRenderer(isPlaceholderData, {
		// 		deletingIds,
		// 		onEdit,
		// 		onDelete,
		// 		onAddOneStock,
		// 		onConsumeOneStock,
		// 	}),
		// },
	];
};

const TransactionList = () => {
	const history = useHistory();
	const location = useLocation();
	const queryClient = useQueryClient();
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [deletingIds, setDeletingIds] = useState([]);
	const [expandedProduct, setExpandedProduct] = useState(null);

	const { page, limit } = useTableUtility();

	const [isModal, toggleModal] = useToggle();
	const [modalData, setModalData] = useState(null);

	const renderVariantList = useVariantList({
		modalData: { value: modalData, set: setModalData },
		expandedProduct: { value: expandedProduct, set: setExpandedProduct },
		toggleModal,
	});

	const apiParams = useMemo(() => ({ page: page.value, limit: limit.value }), [limit.value, page.value]);

	const query = useQuery(
		['transactions', apiParams],
		() =>
			get('/transactions', {
				params: apiParams,
			}),
		{ placeholderData: PLACEHOLDER_DATA.STOCK }
	);

	const deleteTransactionMutation = useMutation((payload) => del(`/transactions/id/${payload}`), {
		onSuccess: (data, payload) => {
			const ids = payload.split(',');

			message.success(Utils.getDeletedSuccessfullyMessage('Transaction', 's', ids.length));
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

	const deleteAllMutation = useMutation(() => del(`/transactions/all`), {
		onSuccess: () => {
			message.success('Transactions have been deleted successfully');
			queryClient.invalidateQueries('transactions');
		},
		onError: (error) => {
			message.error(Utils.getErrorMessages(error));
		},
		onSettled: () => {
			setSelectedRowKeys([]);
			setDeletingIds([]);
		},
	});

	const handleAddPurchase = useCallback(() => {
		if (!isModal) history.push(`/app/transactions/purchases/manage`, { from: '/app/transactions' });
	}, [history, isModal]);

	const handleAddSale = useCallback(() => {
		if (!isModal) history.push(`/app/transactions/sales/manage`, { from: '/app/transactions' });
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
		var confirm = window.confirm(`Are you sure you want to delete selected transactions?`);
		if (!confirm) return;

		const ids = selectedRowKeys.join(',');
		deleteTransactionMutation.mutate(ids);
		setDeletingIds([...selectedRowKeys]);
	}, [deleteTransactionMutation, selectedRowKeys]);

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
			deleteTransactionMutation.mutate(id);
			setDeletingIds((prev) => [...prev, id]);
		},
		[deleteTransactionMutation]
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

	// const tableExpandable = useMemo(
	// 	() => ({
	// 		expandedRowRender: renderVariantList(query.isPlaceholderData),
	// 		onExpand: handleExpandProduct,
	// 		rowExpandable: () => !query.isPlaceholderData,
	// 		expandedRowKeys: getExpandedRowKeys(),
	// 	}),
	// 	[renderVariantList, query.isPlaceholderData, getExpandedRowKeys]
	// );

	const tableProps = useMemo(
		() => ({
			rowKey: '_id',
			loading: query.isLoading || deleteTransactionMutation.isLoading || deleteAllMutation.isLoading,
			pagination: tablePagination,
			dataSource: query.data?.docs,
			rowSelection: tableRowSelection,
			// expandable: tableExpandable,
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
			deleteAllMutation.isLoading,
			deleteTransactionMutation.isLoading,
			deletingIds,
			handleAddOneStock,
			handleConsumeOneStock,
			handleDelete,
			handleEdit,
			query.data?.docs,
			query.data?.pagingCounter,
			query.isLoading,
			query.isPlaceholderData,
			tablePagination,
			tableRowSelection,
		]
	);

	useDidMount(() => {
		Utils.showFlashMessage(history, location, message);
	});

	useEffect(Utils.scrollToTop, [page, limit]);

	useEffect(() => {
		if (query.data?.hasNextPage) {
			const apiParams = { page: page.value + 1, limit: limit.value };
			queryClient.prefetchQuery(['products', apiParams], () => get('/products', { params: apiParams }));
		}
	}, [query.data, page, limit.value, queryClient]);

	return (
		<>
			<Card>
				<Flex alignItems="center" justifyContent="between" mobileFlex={false}>
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
							<Dropdown
								overlay={
									<Menu>
										<Menu.Item onClick={handleAddSale}>
											<Flex alignItems="center">
												<span className="ml-2">Sale</span>
											</Flex>
										</Menu.Item>
										<Menu.Item onClick={handleAddPurchase}>
											<Flex alignItems="center">
												<span className="ml-2">Purchase</span>
											</Flex>
										</Menu.Item>
									</Menu>
								}
								trigger={['click']}
							>
								<Button type="primary" icon={<PlusCircleOutlined />} block>
									Add Transaction
								</Button>
							</Dropdown>
						</Space>
					</Flex>
				</Flex>
				<When condition={query.isError}>
					<Result
						status={500}
						title="Oops.. We're having trouble fetching transactions!"
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
			<AddStock visible={{ set: toggleModal, value: isModal }} data={{ set: setModalData, value: modalData }} />
		</>
	);
};

export default TransactionList;
