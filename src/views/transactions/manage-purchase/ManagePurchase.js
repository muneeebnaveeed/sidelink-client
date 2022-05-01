import React, { useCallback, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Form, Button, message, Space, Row, Col, Card, Divider, Select, Table, Typography, Input } from 'antd';
import Flex from 'components/shared-components/Flex';
import { get, post } from 'utils/server';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import utils from 'utils';
import { useDidMount, useKey } from 'rooks';
import { useFormik } from 'formik';
import Utils from 'utils';
import VariantRow from './VariantRow';
import getRenderers from 'utils/tableRenderers';
import { EllipsisDropdown } from 'components/shared-components';
import { CloseOutlined } from '@ant-design/icons';
import cloneDeep from 'lodash.clonedeep';
import NumberFormat from 'react-number-format';

const initialProduct = { product: '', price: '', quantity: '', total: '0' };

const initialValues = {
	supplier: '',
	paid: '0',
	products: [initialProduct],
	discount: '0',
};

const purchaseActionRenderer =
	({ selectedStock, onAdd, onDelete }) =>
	(row, elm, index) => {
		return (
			<div className="text-right">
				<Flex justifyContent="end">
					{selectedStock.length - 1 === index && (
						<Button type="link" onClick={onAdd} disabled={!row.product}>
							Add Product
						</Button>
					)}
					<Button type="link" shape="round" disabled={selectedStock.length <= 1} onClick={() => onDelete(index)}>
						<CloseOutlined />
					</Button>
				</Flex>
			</div>
		);
	};

const getSelectProduct =
	({ stock, selectedStock, getSelectedProduct, onSelectProduct, isStockDisabled }) =>
	(entity, row, index) => {
		const selectedStockIds = selectedStock.map((e) => e.product);
		const filteredStock = stock?.filter((e) => !selectedStockIds.includes(e._id)).map((e) => e._id);

		return (
			<Select
				style={{ width: 200 }}
				showSearch
				value={getSelectedProduct(index)}
				placeholder="Select product.."
				optionFilterProp="label"
				filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
				onChange={(stockId) => onSelectProduct(stockId, index)}
				disabled={isStockDisabled}
			>
				{stock?.map((s, index) => {
					const isDisabled = !filteredStock.includes(s._id);
					return (
						<Select.Option
							key={`stock-select-${index}`}
							value={s._id}
							label={`${s.product.name} (${s.name}) - ${s.sku}`}
							disabled={isDisabled}
							className="select-option-parent"
						>
							{isDisabled && <div className="select-option-overlay"></div>}
							<Flex flexDirection="column">
								<Typography.Text strong>{`${s.product.name} (${s.name})`}</Typography.Text>
								<Typography.Text type="secondary">{s.sku}</Typography.Text>
							</Flex>
						</Select.Option>
					);
				})}
			</Select>
		);
	};

const getQuantityRenderer =
	({ getQuantity, onChange }) =>
	(value, row, index) => {
		if (!row.product) return null;
		return <Input style={{ width: 75 }} type="number" value={getQuantity(index)} min={1} onChange={onChange(index)} />;
	};

const getTableColumns = ({
	pagingCounter,
	selectedStock,
	stock,
	getSelectedProduct,
	onSelectProduct,
	onAdd,
	onDelete,
	isPlaceholderData,
	isStockDisabled,
	getQuantity,
	onChangeQuantity,
}) => {
	const { indexRenderer, customRenderer, priceRenderer } = getRenderers(isPlaceholderData);

	return [
		{
			width: 0,
			title: '#',
			render: indexRenderer(pagingCounter),
		},
		{
			width: 0,
			title: 'Product',
			render: customRenderer(
				getSelectProduct({ stock, selectedStock, getSelectedProduct, onSelectProduct, isStockDisabled })
			),
		},
		{
			width: 100,
			title: 'Price',
			dataIndex: 'price',
			render: priceRenderer(),
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			render: customRenderer(getQuantityRenderer({ getQuantity, onChange: onChangeQuantity })),
		},
		{
			align: 'right',
			width: 150,
			render: purchaseActionRenderer({ selectedStock, onAdd, onDelete }),
		},
	];
};

const validateForm = (values) => {
	const errors = {};

	const { supplier, discount, paid } = values;

	if (!supplier) errors.supplier = 'Please select a supplier';
	if (discount === undefined || discount === null || discount === '') errors.discount = 'Please enter discount';
	if (paid === undefined || paid === null || paid === '') errors.paid = 'Please enter paid amount';

	return errors;
};

const ManagePurchase = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();

	const editingState = useMemo(() => location.state, []);

	const handleDiscard = useCallback(history.goBack, []);

	const suppliersQuery = useQuery('all-suppliers', () => get('/suppliers/all'));

	const stockQuery = useQuery('all-stock', () => get('/stock/all'));

	const mutation = useMutation((payload) => post('/purchases', payload), {
		onSuccess: async () => {
			queryClient.invalidateQueries('transactions');
			queryClient.invalidateQueries('stock');
			queryClient.invalidateQueries('all-stock');

			history.push(editingState?.from || '/app/transactions', { flashMessage: 'Purchase has been made successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		Utils.showFlashMessage(history, location, message);
	});

	const handleSubmit = useCallback((values) => {
		// const payload = stockState ? values.variants.map((e) => ({ _id: e._id, quantity: e.quantity })) : values.variants;

		mutation.mutate(values);

		// console.log(values);
	}, []);

	const formik = useFormik({
		initialValues,
		validateOnBlur: false,
		validateOnMount: false,
		validateOnChange: false,
		validate: validateForm,
		onSubmit: handleSubmit,
	});

	const handleChangeSupplier = useCallback((supplierId) => {
		formik.setFieldValue('supplier', supplierId);
	}, []);

	const handleAddSupplier = useCallback(
		() => history.push('/app/contacts/suppliers/manage', { from: '/app/transactions/purchases/manage' }),
		[history]
	);

	const getSelectedProduct = useCallback(
		(index) => formik.values.products[index]?.product || null,
		[formik.values.products]
	);

	const handleSelectProduct = useCallback(
		(productId, index) => {
			const products = cloneDeep(formik.values.products);

			const correspondingStock = stockQuery.data.find((e) => e._id === productId);

			products[index].product = productId;
			products[index].sku = correspondingStock.sku;
			products[index].price = correspondingStock.price;
			products[index].quantity = correspondingStock.quantity;
			products[index].total = correspondingStock.price * correspondingStock.quantity;

			console.log({ correspondingStock });

			formik.setFieldValue('products', products);
		},
		[formik, stockQuery.data]
	);

	const handleAddProduct = useCallback(() => {
		const products = cloneDeep(formik.values.products);
		products.push({ ...initialProduct });
		formik.setFieldValue('products', products);
	}, [formik]);

	const handleDeleteProduct = useCallback(
		(index) => {
			const products = cloneDeep(formik.values.products);
			products.splice(index, 1);
			formik.setFieldValue('products', products);
		},
		[formik]
	);

	const getQuantity = useCallback((index) => formik.values.products[index]?.quantity, [formik.values.products]);

	const handleChangeQuantity = useCallback(
		(index) => (event) => {
			const value = event.target.value;
			const products = cloneDeep(formik.values.products);

			products[index].quantity = value;
			products[index].total = products[index].price * value;

			formik.setFieldValue('products', products);
		},
		[formik]
	);

	const subtotal = useMemo(() => {
		const subtotals = formik.values.products.map((e) => parseInt(e.total));
		return [0, 0, ...subtotals].reduce((a, b) => a + b);
	}, [formik.values.products]);

	const total = useMemo(() => {
		return subtotal - Math.floor(subtotal * (formik.values.discount / 100));
	}, [formik.values.discount, subtotal]);

	const tableProps = useMemo(
		() => ({
			rowKey: '_id',
			dataSource: formik.values.products,
			pagination: false,
			scroll: { x: 725 },
			columns: getTableColumns({
				pagingCounter: 1,
				getSelectedProduct,
				isStockDisabled: stockQuery.isLoading,
				onSelectProduct: handleSelectProduct,
				onDelete: handleDeleteProduct,
				isPlaceholderData: false,
				stock: stockQuery.data,
				selectedStock: formik.values.products,
				onAdd: handleAddProduct,
				getQuantity,
				onChangeQuantity: handleChangeQuantity,
			}),
		}),
		[
			formik.values.products,
			getQuantity,
			getSelectedProduct,
			handleAddProduct,
			handleChangeQuantity,
			handleDeleteProduct,
			handleSelectProduct,
			stockQuery.data,
			stockQuery.isLoading,
		]
	);

	const getValidationError = useCallback((key) => formik.errors[key] || null, [formik.errors]);

	const getValidationStatus = useCallback((key) => (formik.errors[key] ? 'error' : null), [formik.errors]);

	return (
		<>
			<Form
				layout="vertical"
				name="purchase_form"
				className="ant-advanced-search-form"
				autoComplete="off"
				onFinish={formik.handleSubmit}
			>
				<PageHeaderAlt className="border-bottom page-header-sticky" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-0">Make Purchase</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Back
									</Button>
									<Button type="primary" htmlType="submit" loading={mutation.isLoading}>
										Make Purchase
									</Button>
								</Space>
							</Flex>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container" style={{ marginTop: 120 }}>
					<Row gutter={32}>
						<Col sm={24}>
							<Card
								extra={
									<Button type="link" onClick={handleAddSupplier}>
										Add Supplier
									</Button>
								}
							>
								<Row gutter={16} style={{ marginBottom: 24 }}>
									<Col xs={18}>
										<Form.Item
											style={{ marginBottom: 0 }}
											required
											label="Supplier"
											validateStatus={getValidationStatus('supplier')}
											help={getValidationError('supplier')}
										>
											<Select
												showSearch
												value={formik.values.supplier || null}
												placeholder="Select supplier"
												loading={suppliersQuery.isLoading}
												optionFilterProp="children"
												filterOption={(input, option) =>
													option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												onChange={handleChangeSupplier}
											>
												{suppliersQuery.data?.map((supplier, index) => (
													<Select.Option key={`supplier-select-${index}`} value={supplier._id}>
														{supplier.name}
													</Select.Option>
												))}
											</Select>
										</Form.Item>
									</Col>
									<Col xs={6}>
										<Form.Item
											style={{ marginBottom: 0 }}
											required
											label="Paid"
											validateStatus={getValidationStatus('paid')}
											help={getValidationError('paid')}
										>
											<Input type="number" name="paid" value={formik.values.paid} onChange={formik.handleChange} />
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>

					<Row>
						<Col sm={24}>
							<Card>
								<Table {...tableProps} />
							</Card>
						</Col>
					</Row>

					<Row>
						<Col sm={24}>
							<Card>
								<Flex justifyContent="end">
									<Space direction="vertical">
										<div className="text-right">
											<Typography.Text strong>Subtotal: </Typography.Text>
											<Typography.Text type="secondary">
												<NumberFormat
													displayType={'text'}
													value={subtotal}
													prefix={'PKR '}
													thousandSeparator
													thousandsGroupStyle={'lakh'}
												/>
											</Typography.Text>
										</div>
										<div className="discount-form-item">
											<Form.Item label="Discount (%)" labelAlign="right">
												<Input
													style={{ width: 100 }}
													className="text-right"
													type="number"
													name="discount"
													value={formik.values.discount}
													onChange={formik.handleChange}
												/>
											</Form.Item>
										</div>
										<div className="text-right">
											<Typography.Text strong>Total: </Typography.Text>
											<Typography.Text type="secondary">
												<NumberFormat
													displayType={'text'}
													value={total}
													prefix={'PKR '}
													thousandSeparator
													thousandsGroupStyle={'lakh'}
												/>
											</Typography.Text>
										</div>
									</Space>
								</Flex>
							</Card>
						</Col>
					</Row>
				</div>
			</Form>
		</>
	);
};

export default ManagePurchase;
