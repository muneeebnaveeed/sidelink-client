import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Button, Menu, message, Dropdown, Space, Spin, Result } from 'antd';
import {
	UploadOutlined,
	DownOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	PlusCircleOutlined,
} from '@ant-design/icons';
import {
	BulkActionDropdownMenu,
	EllipsisDropdown,
	Flex,
	SingleDropdownMenu,
	Spinner,
	SpinnerContainer,
	TableSkeleton,
} from 'components/shared-components';

import NumberFormat from 'react-number-format';
import { useHistory, useLocation } from 'react-router-dom';
import Utils, { useTableUtility } from 'utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { del, get } from 'utils/server';
import BulkImport from './BulkImport.modal';
import { useDidMount, useEffectOnceWhen, useKey, useToggle } from 'rooks';
import { When } from 'react-if';
import getRenderers from 'utils/tableRenderers';
import PLACEHOLDER_DATA from 'utils/data';

const customActionRenderer = (isPlaceholderData, params) => (row, elm) => {
	if (elm.name === 'Walk-in') return null;

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

const getTableColumns = ({ pagingCounter, onEdit, onDelete, deletingIds, isPlaceholderData }) => {
	const { indexRenderer, defaultRenderer, actionRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 0,
			title: '#',
			render: indexRenderer(pagingCounter),
		},
		{
			title: 'Name',
			dataIndex: 'name',
			render: defaultRenderer(),
		},
		{
			title: 'Phone',
			dataIndex: 'phone',
			render: defaultRenderer(),
		},
		{
			fixed: 'right',
			width: 150,
			render: customActionRenderer(isPlaceholderData, { deletingIds, onEdit, onDelete }),
		},
	];
};

const CustomerList = () => {
	const history = useHistory();
	const location = useLocation();
	const queryClient = useQueryClient();
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [deletingIds, setDeletingIds] = useState([]);

	const { page, limit, search } = useTableUtility();

	const [isModal, toggleModal] = useToggle();

	const apiParams = useMemo(
		() => ({ page: page.value, limit: limit.value, search: search.debounced }),
		[limit.value, page.value, search.debounced]
	);

	const query = useQuery(
		['customers', apiParams],
		() =>
			get('/customers', {
				params: apiParams,
			}),
		{ placeholderData: PLACEHOLDER_DATA.CUSTOMERS }
	);

	const deleteMutation = useMutation((payload) => del(`/customers/id/${payload}`), {
		onSuccess: (response, payload) => {
			const ids = payload.split(',');
			message.success(Utils.getDeletedSuccessfullyMessage('Customer', 's', ids.length));
			queryClient.invalidateQueries('customers');
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

	const deleteAllMutation = useMutation(() => del(`/customers/all`), {
		onSuccess: () => {
			setSelectedRowKeys([]);
			setDeletingIds([]);
			message.success('Customers have been deleted successfully');
			queryClient.invalidateQueries('customers');
		},
		onError: (error) => {
			message.error(Utils.getErrorMessages(error));
		},
	});

	const handleAdd = useCallback(() => {
		history.push(`/app/contacts/customers/manage`);
	}, [history]);

	const handleEdit = useCallback(
		(row) => {
			history.push('/app/contacts/customers/manage', { customer: row });
		},
		[history]
	);

	const handleBulkDelete = useCallback(() => {
		var confirm = window.confirm(`Are you sure you want to delete selected customers?`);
		if (!confirm) return;

		const ids = selectedRowKeys.join(',');
		deleteMutation.mutate(ids);
		setDeletingIds([...selectedRowKeys]);
	}, [deleteMutation, selectedRowKeys]);

	const handleDeleteAll = useCallback(() => {
		var confirm = window.confirm(`Are you sure you want to delete all stock?`);
		if (!confirm) return;
		deleteAllMutation.mutate();
	}, [deleteAllMutation]);

	const handleDelete = useCallback(
		(row) => {
			var confirm = window.confirm('Are you sure to delete the customer?');
			if (!confirm) return;

			const id = row._id;
			deleteMutation.mutate(id);
			setDeletingIds((prev) => [...prev, id]);
		},
		[deleteMutation]
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
			disabled: deletingIds.includes(row._id) || query.isPlaceholderData || row.name === 'Walk-in',
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

	const tableProps = useMemo(
		() => ({
			rowKey: '_id',
			loading: query.isLoading || deleteMutation.isLoading,
			pagination: tablePagination,
			dataSource: query.data?.docs,
			rowSelection: tableRowSelection,
			columns: getTableColumns({
				pagingCounter: query.data?.pagingCounter,
				onEdit: handleEdit,
				onDelete: handleDelete,
				deletingIds,
				isPlaceholderData: query.isPlaceholderData,
			}),
		}),
		[
			deleteMutation.isLoading,
			deletingIds,
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

	useEffect(Utils.scrollToTop, [page, limit]);

	useEffect(() => {
		if (query.data?.hasNextPage) {
			const apiParams = { page: page.value + 1, limit: limit.value, search: search.debounced };
			queryClient.prefetchQuery(['customers', apiParams], () => get('/customers', { params: apiParams }));
		}
	}, [query.data, page, limit.value, search.debounced, queryClient]);

	return (
		<>
			<Card title="Customers">
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
										onImportCSV={toggleModal}
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
							<Button onClick={handleAdd} type="primary" icon={<PlusCircleOutlined />} block>
								Add Customer
							</Button>
						</Space>
					</Flex>
				</Flex>
				<When condition={query.isError}>
					<Result
						status={500}
						title="Oops.. We're having trouble fetching customers!"
						subTitle={Utils.getErrorMessages(query.error)}
						extra={
							<Button type="danger" onClick={query.refetch}>
								Try again
							</Button>
						}
					/>
				</When>
				<When condition={query.isLoading}>
					<SpinnerContainer>
						<Spinner />
					</SpinnerContainer>
				</When>
				<When condition={query.isSuccess}>
					<div className="table-responsive">
						<Table {...tableProps} />
					</div>
				</When>
			</Card>
			<BulkImport visible={{ set: toggleModal, value: isModal }} />
		</>
	);
};

export default CustomerList;
