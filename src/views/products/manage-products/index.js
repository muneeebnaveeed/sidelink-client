import React, { useState } from 'react';
import { Card, Table, Select, Input, Button, Badge, Menu, message } from 'antd';
import ProductListData from 'assets/data/product-list.data.json';
import { EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex';
import NumberFormat from 'react-number-format';
import { useHistory } from 'react-router-dom';
import utils from 'utils';
import { useMutation, useQuery } from 'react-query';
import { del, get } from 'utils/server';
import axios from 'axios';

const { Option } = Select;

const getStockStatus = (stockCount) => {
	if (stockCount >= 10) {
		return (
			<>
				<Badge status="success" />
				<span>In Stock</span>
			</>
		);
	}
	if (stockCount < 10 && stockCount > 0) {
		return (
			<>
				<Badge status="warning" />
				<span>Limited Stock</span>
			</>
		);
	}
	if (stockCount === 0) {
		return (
			<>
				<Badge status="error" />
				<span>Out of Stock</span>
			</>
		);
	}
	return null;
};

const categories = ['Cloths', 'Bags', 'Shoes', 'Watches', 'Devices'];

const ProductList = () => {
	let history = useHistory();
	const [list, setList] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [limit, setLimit] = useState(2);
	const [page, setPage] = useState(1);

	const query = useQuery(['products', page, limit, list], () => get('/products', { params: { page, limit } }), {
		onSuccess: (data) => {
			setList(data.docs);
		},
	});

	const dropdownMenu = (row) => (
		<Menu>
			{/* <Menu.Item onClick={() => viewDetails(row)}>
				<Flex alignItems="center">
					<EyeOutlined />
					<span className="ml-2">View Details</span>
				</Flex>
			</Menu.Item> */}
			<Menu.Item onClick={() => editProduct(row)}>
				<Flex alignItems="center">
					<EditOutlined />
					<span className="ml-2">Edit</span>
				</Flex>
			</Menu.Item>
			<Menu.Item onClick={() => deleteRow(row)}>
				<Flex alignItems="center">
					<DeleteOutlined />
					<span className="ml-2">{selectedRows.length > 0 ? `Delete (${selectedRows.length})` : 'Delete'}</span>
				</Flex>
			</Menu.Item>
		</Menu>
	);

	const addProduct = () => {
		history.push(`/app/products/add-product`);
	};

	const viewDetails = (row) => {
		// history.push(`/app/products/edit-product/${row.id}`);
	};

	const editProduct = (row) => {
		history.push({
			pathname: `/app/products/edit-product/${row.id}`,
			state: { price: row?.price, name: row?.name, sku: row?.sku },
		});
	};



	const deleteProductMutation = useMutation(
		(payload) => {
			return del(`/products/id/${payload}`);
		},
		{
			onSuccess: (response, payload) => {
				setList((prev) => prev.filter((doc) => doc._id !== payload));

				message.success(`Product deleted`);
			},
			onError: (error) => {
				message.error(error?.response?.data?.data[0] || error.message);
			},
		}
	);



	const deleteRow = (row) => {

		var a = window.confirm("Are you sure to delete row ?");

		if (a) {
			alert("clicked on yes");

		} else {
			alert("clicked on no");
		}




		deleteProductMutation.mutate(row._id);

		// const objKey = 'id';
		// let data = list;
		// if (selectedRows.length > 1) {
		// 	selectedRows.forEach((elm) => {
		// data = utils.deleteArrayRow(data, objKey, elm.id);
		// 		setList(data);
		// 		setSelectedRows([]);
		// 	});
		// } else {
		// 	data = utils.deleteArrayRow(data, objKey, row.id);
		// 	setList(data);
		// }
	};

	const tableColumns = [
		// {
		// 	title: 'ID',
		// 	dataIndex: 'id',
		// },
		// {
		// 	title: 'Product',
		// 	dataIndex: 'name',
		// 	render: (_, record) => (
		// 		<div className="d-flex">
		// 			<AvatarStatus size={60} type="square" name={record.name} />
		// 		</div>
		// 	),
		// 	sorter: (a, b) => utils.antdTableSorter(a, b, 'name'),
		// },
		{
			title: 'Product',
			dataIndex: 'name',
			sorter: (a, b) => utils.antdTableSorter(a, b, 'name'),
		},
		// {
		// 	title: 'Category',
		// 	dataIndex: 'category',
		// 	sorter: (a, b) => utils.antdTableSorter(a, b, 'category'),
		// },
		{
			title: 'Price',
			dataIndex: 'price',
			render: (price) => (
				<div>
					<NumberFormat
						displayType={'text'}
						value={(Math.round(price * 100) / 100).toFixed(2)}
						prefix={'$'}
						thousandSeparator={true}
					/>
				</div>
			),
			sorter: (a, b) => utils.antdTableSorter(a, b, 'price'),
		},
		{
			title: 'SKU',
			dataIndex: 'sku',
			sorter: (a, b) => utils.antdTableSorter(a, b, 'price'),
		},
		// {
		// 	title: 'Stock',
		// 	dataIndex: 'stock',
		// 	sorter: (a, b) => utils.antdTableSorter(a, b, 'stock'),
		// },
		// {
		// 	title: 'Status',
		// 	dataIndex: 'stock',
		// 	render: (stock) => <Flex alignItems="center">{getStockStatus(stock)}</Flex>,
		// 	sorter: (a, b) => utils.antdTableSorter(a, b, 'stock'),
		// },
		{
			title: '',
			dataIndex: 'actions',
			render: (_, elm) => (
				<div className="text-right">
					<EllipsisDropdown menu={dropdownMenu(elm)} />
				</div>
			),
		},
	];

	const rowSelection = {
		onChange: (key, rows) => {
			setSelectedRows(rows);
			setSelectedRowKeys(key);
		},
	};

	const onSearch = (e) => {
		const value = e.currentTarget.value;
		const searchArray = e.currentTarget.value ? list : [];
		const data = utils.wildCardSearch(searchArray, value);
		setList(data);
		setSelectedRowKeys([]);
	};

	const handleShowCategory = (value) => {
		if (value !== 'All') {
			const key = 'category';
			const data = utils.filterArray(list, key, value);
			setList(data);
		} else {
			setList(list);
		}
	};

	return (
		<Card>
			<Flex alignItems="center" justifyContent="between" mobileFlex={false}>
				<Flex className="mb-1" mobileFlex={false}>
					<div className="mr-md-3 mb-3">
						<Input placeholder="Search" prefix={<SearchOutlined />} onChange={(e) => onSearch(e)} />
					</div>
					<div className="mb-3">
						<Select
							defaultValue="All"
							className="w-100"
							style={{ minWidth: 180 }}
							onChange={handleShowCategory}
							placeholder="Category"
						>
							<Option value="All">All</Option>
							{categories.map((elm) => (
								<Option key={elm} value={elm}>
									{elm}
								</Option>
							))}
						</Select>
					</div>
				</Flex>
				<div>
					<Button onClick={addProduct} type="primary" icon={<PlusCircleOutlined />} block>
						Add product
					</Button>
				</div>
			</Flex>
			<div className="table-responsive">
				<Table
					loading={query.isLoading}
					columns={tableColumns}
					dataSource={query?.data?.docs}
					pagination={{
						// current: query?.data?.pagingCounter,
						pageSize: limit,
						// pageSizeOptions: [2, 4, 6, 8, 10],
						responsive: true,
						showLessItems: true,
						showSizeChanger: true,
						showQuickJumper: true,
						total: query?.data?.totalDocs,
						onChange: (page, pageSize) => {
							setPage(page);
							setLimit(pageSize);
						},
					}}
					rowKey="id"
					rowSelection={{
						selectedRowKeys: selectedRowKeys,
						type: 'checkbox',
						preserveSelectedRowKeys: false,
						...rowSelection,
					}}
				/>
			</div>
		</Card>
	);
};

export default ProductList;
