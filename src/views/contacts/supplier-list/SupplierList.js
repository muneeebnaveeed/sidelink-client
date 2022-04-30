import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Button, Menu, message, Dropdown, Space, Spin, Result } from 'antd';
import { DownOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { BulkActionDropdownMenu, Flex } from 'components/shared-components';

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
			render: actionRenderer({ deletingIds, onEdit, onDelete }),
		},
	];
};

const SupplierList = () => {
	const history = useHistory();
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
		['suppliers', apiParams],
		() =>
			get('/suppliers', {
				params: apiParams,
			}),
		{ placeholderData: PLACEHOLDER_DATA.SUPPLIERS }
	);

	const deleteMutation = useMutation((payload) => del(`/suppliers/id/${payload}`), {
		onSuccess: (response, payload) => {
			const ids = payload.split(',');
			message.success(Utils.getDeletedSuccessfullyMessage('Supplier', 's', ids.length));
			queryClient.invalidateQueries('suppliers');
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

	const deleteAllMutation = useMutation(() => del(`/suppliers/all`), {
		onSuccess: () => {
			setSelectedRowKeys([]);
			setDeletingIds([]);
			message.success('Suppliers have been deleted successfully');
			queryClient.invalidateQueries('suppliers');
		},
		onError: (error) => {
			message.error(Utils.getErrorMessages(error));
		},
	});

	const handleAdd = useCallback(() => {
		history.push(`/app/contacts/suppliers/manage`);
	}, [history]);

	const handleEdit = useCallback(
		(row) => {
			history.push('/app/contacts/suppliers/manage', row);
		},
		[history]
	);

	const handleBulkDelete = useCallback(() => {
		var confirm = window.confirm(`Are you sure you want to delete selected suppliers?`);
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
			var confirm = window.confirm('Are you sure to delete the supplier?');
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
			queryClient.prefetchQuery(['suppliers', apiParams], () => get('/suppliers', { params: apiParams }));
		}
	}, [query.data, page, limit.value, search.debounced, queryClient]);

	return (
		<>
			<Card title="Suppliers">
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
								Add Supplier
							</Button>
						</Space>
					</Flex>
				</Flex>
				<When condition={query.isError}>
					<Result
						status={500}
						title="Oops.. We're having trouble fetching suppliers!"
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
			<BulkImport visible={{ set: toggleModal, value: isModal }} />
		</>
	);
};

export default SupplierList;
