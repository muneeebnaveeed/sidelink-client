import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Card,
	Table,
	Input,
	Button,
	message,
	Dropdown,
	Space,
	Spin,
	Result,
	Typography,
	Menu,
	Tag,
	Select,
} from 'antd';
import { DownOutlined, DeleteOutlined, PlusCircleOutlined, PrinterOutlined } from '@ant-design/icons';
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
import PayTransaction from './PayTransaction.modal';
import { useDidMount, useKey, useToggle } from 'rooks';
import { When } from 'react-if';
import getRenderers from 'utils/tableRenderers';
import PLACEHOLDER_DATA from 'utils/data';
import useVariantList from './VariantList';

const typeFilterOptions = [
	{ label: 'Sales', value: 'sale' },
	{ label: 'Purchases', value: 'purchase' },
	{ label: 'Sales and Purchases', value: 'sale,purchase' },
];

const paidFilterOptions = [
	{ label: 'All', value: 'all' },
	{ label: 'Fully Paid', value: 'full' },
	{ label: 'Partial Paid', value: 'partial' },
];

const TransactionDropdownMenu = ({ row, onPrint, onDelete }) => {
	return (
		<Menu>
			<Menu.Item onClick={() => onPrint(row)} disabled>
				<Flex alignItems="center">
					<PrinterOutlined />
					<span className="ml-2">Print</span>
				</Flex>
			</Menu.Item>
			<Menu.Item onClick={() => onDelete(row)}>
				<Flex alignItems="center">
					<DeleteOutlined />
					<span className="ml-2">Delete</span>
				</Flex>
			</Menu.Item>
		</Menu>
	);
};

const transactionActionRenderer = (isPlaceholderData, params) => (row, elm) => {
	return (
		<TableSkeleton loading={isPlaceholderData}>
			<div className="text-right">
				{params.deletingIds?.includes(elm._id) ? (
					<Spin />
				) : (
					<Space>
						<Button type="link" disabled={!params.canPay(elm)} onClick={() => params.onPay(elm)}>
							Pay
						</Button>
						<EllipsisDropdown
							menu={<TransactionDropdownMenu row={elm} onDelete={params.onDelete} onPrint={params.onPrint} />}
						/>
					</Space>
				)}
			</div>
		</TableSkeleton>
	);
};

const getTableColumns = ({ pagingCounter, onDelete, deletingIds, isPlaceholderData, canPay, onPay, onPrint }) => {
	const { indexRenderer, defaultRenderer, priceRenderer, customRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 0,
			title: '#',
			render: indexRenderer(pagingCounter),
		},
		{
			width: 250,
			title: 'Contact',
			dataIndex: ['contact', 'name'],
			render: customRenderer((name, row) => (
				<Space>
					<div>{name}</div>
					<Tag color={row.type === 'SALE' ? 'success' : 'error'}>{row.type}</Tag>
				</Space>
			)),
		},
		{
			width: 150,
			title: 'Subtotal',
			dataIndex: 'subtotal',
			render: priceRenderer(),
			sorter: true,
		},
		{
			width: 0,
			title: 'Discount',
			dataIndex: 'discount',
			render: defaultRenderer(),
			sorter: true,
		},
		{
			width: 150,
			title: 'Total',
			dataIndex: 'total',
			render: priceRenderer(),
			sorter: true,
		},
		{
			width: 150,
			title: 'Paid',
			dataIndex: 'paid',
			render: priceRenderer(),
			sorter: true,
		},
		{
			width: 150,
			render: transactionActionRenderer(isPlaceholderData, {
				deletingIds,
				canPay,
				onPay,
				onPrint,
				onDelete,
			}),
		},
	];
};

const TransactionList = () => {
	const history = useHistory();
	const location = useLocation();
	const queryClient = useQueryClient();
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [deletingIds, setDeletingIds] = useState([]);
	const [expandedProduct, setExpandedProduct] = useState(null);

	const { page, limit, sort } = useTableUtility();

	const [isModal, toggleModal] = useToggle();
	const [modalData, setModalData] = useState(null);
	const [typeFilter, setTypeFilter] = useState('sale,purchase');
	const [paidFilter, setPaidFilter] = useState('all');

	const renderVariantList = useVariantList({
		modalData: { value: modalData, set: setModalData },
		expandedProduct: { value: expandedProduct, set: setExpandedProduct },
		toggleModal,
	});

	const apiParams = useMemo(
		() => ({ page: page.value, limit: limit.value, sort: sort.value, type: typeFilter, paid: paidFilter }),
		[limit.value, page.value, paidFilter, sort.value, typeFilter]
	);

	const query = useQuery(
		['transactions', apiParams],
		() =>
			get('/transactions', {
				params: apiParams,
			}),
		{ placeholderData: PLACEHOLDER_DATA.TRANSACTIONS }
	);

	const deleteTransactionMutation = useMutation((payload) => del(`/transactions/id/${payload}`), {
		onSuccess: (data, payload) => {
			const ids = payload.split(',');

			message.success(Utils.getDeletedSuccessfullyMessage('Transaction', 's', ids.length));
			queryClient.invalidateQueries('transactions');
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

	const canPayTransaction = useCallback((transaction) => {
		return transaction.paid < transaction.total;
	}, []);

	const handlePayTransaction = useCallback(
		(transaction) => {
			setModalData(transaction);
			toggleModal();
		},
		[toggleModal]
	);

	const handlePrintTransaction = useCallback((transaction) => {
		console.log(transaction);
	}, []);

	const handleDelete = useCallback(
		(row) => {
			var confirm = window.confirm('Are you sure to delete the transaction?');
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

	const tableExpandable = useMemo(
		() => ({
			expandedRowRender: renderVariantList,
			onExpand: handleExpandProduct,
			rowExpandable: () => !query.isPlaceholderData,
			expandedRowKeys: getExpandedRowKeys(),
		}),
		[renderVariantList, query.isPlaceholderData, getExpandedRowKeys]
	);

	const tableProps = useMemo(
		() => ({
			rowKey: '_id',
			loading: query.isLoading || deleteTransactionMutation.isLoading || deleteAllMutation.isLoading,
			pagination: tablePagination,
			dataSource: query.data?.docs,
			rowSelection: tableRowSelection,
			scroll: { x: 1015 },
			onChange: Utils.handleChangeSort(sort.set),
			expandable: tableExpandable,
			columns: getTableColumns({
				pagingCounter: query.data?.pagingCounter,
				canPay: canPayTransaction,
				onPay: handlePayTransaction,
				onDelete: handleDelete,
				onPrint: handlePrintTransaction,
				deletingIds,
				isPlaceholderData: query.isPlaceholderData,
			}),
		}),
		[
			canPayTransaction,
			deleteAllMutation.isLoading,
			deleteTransactionMutation.isLoading,
			deletingIds,
			handleDelete,
			handlePayTransaction,
			handlePrintTransaction,
			query.data?.docs,
			query.data?.pagingCounter,
			query.isLoading,
			query.isPlaceholderData,
			sort.set,
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
			const apiParams = {
				page: page.value + 1,
				limit: limit.value,
				sort: sort.value,
				type: typeFilter,
				paid: paidFilter,
			};
			queryClient.prefetchQuery(['transactions', apiParams], () => get('/transactions', { params: apiParams }));
		}
	}, [page, limit.value, typeFilter, paidFilter]);

	return (
		<>
			<Card>
				<Flex alignItems="center" justifyContent="between" mobileFlex={false}>
					<Space>
						<Select
							style={{ width: 200 }}
							value={typeFilter}
							optionFilterProp="children"
							filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
							onChange={setTypeFilter}
						>
							{typeFilterOptions.map((option, index) => (
								<Select.Option value={option.value} key={`transaction-type-filter-select-${index}`}>
									{option.label}
								</Select.Option>
							))}
						</Select>
						<Select
							style={{ width: 120 }}
							value={paidFilter}
							optionFilterProp="children"
							filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
							onChange={setPaidFilter}
						>
							{paidFilterOptions.map((option, index) => (
								<Select.Option value={option.value} key={`transaction-paid-filter-select-${index}`}>
									{option.label}
								</Select.Option>
							))}
						</Select>
					</Space>
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
			<PayTransaction visible={{ set: toggleModal, value: isModal }} data={{ set: setModalData, value: modalData }} />
		</>
	);
};

export default TransactionList;
