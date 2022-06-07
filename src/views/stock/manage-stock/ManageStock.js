import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Form, Button, message, Space, Row, Col, Card, Input, InputNumber, Divider, Select } from 'antd';
import Flex from 'components/shared-components/Flex';
import { get, patch, post } from 'utils/server';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import utils from 'utils';
import { useDidMount, useKey } from 'rooks';
import { useFormik } from 'formik';
import Utils from 'utils';
import VariantRow from './VariantRow';
import { AnimatedWrapper, Spinner, SpinnerContainer } from 'components/shared-components';

const initialValues = {
	product: '',
	variants: [],
};

const validateForm = (values) => {
	const errors = {};

	const variantErrors = {};

	values.variants.forEach((variant, index) => {
		const error = { quantity: '' };

		if (variant.quantity === '' || variant.quantity === null || variant.quantity === undefined)
			error.quantity = 'Please enter quantity';

		if (error.quantity) variantErrors[index] = error;
	});

	if (Object.keys(variantErrors).length) errors.variants = variantErrors;

	return errors;
};

const transformVariant = (data) =>
	data.map((e) => ({ _id: e._id, name: e.name, price: e.price, sku: e.sku, quantity: '0' }));

const ManageStock = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [isConsuming, setIsConsuming] = useState(false);

	const editingState = useMemo(() => location.state, []);
	const stockState = useMemo(() => editingState?.stock, []);

	const handleDiscard = useCallback(history.goBack, []);

	const productsQuery = useQuery('all-products-only', () => get('/products/products_only'));

	const addMutation = useMutation((payload) => post('/stock', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('stock');
			history.push('/app/stock', { flashMessage: 'Stock has been added successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const consumeMutation = useMutation((payload) => post('/stock/consume', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('stock');
			history.push('/app/stock', { flashMessage: 'Stock has been consumed successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const editMutation = useMutation((payload) => patch(`/stock/id/${stockState?._id}`, payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('stock');
			history.push('/app/stock', { flashMessage: 'Stock has been updated successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const mutation = useMemo(
		() => (isEditing ? editMutation : isConsuming ? consumeMutation : addMutation),
		[addMutation, consumeMutation, editMutation, isConsuming, isEditing]
	);

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		Utils.showFlashMessage(history, location, message);

		if (stockState) {
			let { product, variants, isEditing: editing = false, isConsuming: consuming = false } = stockState;

			variants = variants.map((e) => {
				const { name, price, sku, _id } = e.productVariant;
				const v = { _id, name, price, sku };

				if (editing || consuming) v.quantity = e.quantity;
				else v.quantity = '0';

				return v;
			});

			formik.setFieldValue('product', product._id);
			formik.setFieldValue('variants', variants);
			if (editing) setIsEditing(editing);
			if (consuming) setIsConsuming(consuming);
		}
	});

	const handleSubmit = useCallback(
		(values) => {
			const payload = stockState ? values.variants.map((e) => ({ _id: e._id, quantity: e.quantity })) : values.variants;

			mutation.mutate(payload);
		},
		[stockState, mutation]
	);

	const formik = useFormik({
		initialValues,
		validate: validateForm,
		validateOnChange: false,
		validateOnMount: false,
		validateOnBlur: true,
		onSubmit: handleSubmit,
	});

	const variantsQuery = useQuery(
		['product-variants', formik.values.product],
		() => get(`/product_variants/product_id/${formik.values.product}`),
		{
			enabled: Boolean(formik.values.product),
			onSuccess: (data) => {
				if (formik.values.variants.length <= 0) formik.setFieldValue('variants', transformVariant(data));
			},
		}
	);

	const handleChangeProduct = useCallback((productId) => {
		formik.setFieldValue('product', productId);
		formik.setFieldError('variants', []);

		const variants = queryClient.getQueryData(['product-variants', productId]);
		if (variants) formik.setFieldValue('variants', transformVariant(variants));
	}, []);

	const showAddProductButton = useMemo(() => !isEditing && !isConsuming, [isConsuming, isEditing]);

	const handleAddProduct = useCallback(
		() => history.push('/app/products/manage', { from: '/app/stock/manage' }),
		[history]
	);

	return (
		<AnimatedWrapper>
			<Form
				layout="vertical"
				name="product_form"
				className="ant-advanced-search-form"
				autoComplete="off"
				onFinish={formik.handleSubmit}
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-0">{isEditing ? 'Update Stock' : `Add New Stock`}</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Back
									</Button>
									<Button type="primary" htmlType="submit" loading={mutation.isLoading}>
										{isEditing ? 'Update Stock' : 'Add Stock'}
									</Button>
								</Space>
							</Flex>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container" style={{ marginTop: 120 }}>
					<Row gutter={32}>
						<Col xs={24}>
							<Card
								extra={
									<Button type="link" onClick={handleAddProduct}>
										Add New Product
									</Button>
								}
							>
								<Row gutter={16} style={{ marginBottom: 24 }}>
									<Col xs={24}>
										<Form.Item style={{ marginBottom: 0 }} required label="Product">
											<Select
												showSearch
												disabled={isEditing}
												value={formik.values.product || null}
												placeholder="Select existing product.."
												loading={productsQuery.isLoading || variantsQuery.isLoading}
												optionFilterProp="children"
												filterOption={(input, option) =>
													option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												onChange={handleChangeProduct}
											>
												{productsQuery.data?.map((product, index) => (
													<Select.Option key={`product-select-${index}`} value={product._id}>
														{product.name}
													</Select.Option>
												))}
											</Select>
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>
					{formik.values.variants?.map((variant, index) => {
						const { values, errors, setFieldError, setFieldValue } = formik;

						const variantProps = {
							index,
							...variant,
							productName: values.name,
							key: `product-variant-${index}`,
							variants: values.variants,
							variantErrors: errors.variants,
							setFieldValue: setFieldValue,
							setFieldError: setFieldError,
						};

						return (
							<Row>
								<Col xs={24}>
									<Card>
										<VariantRow {...variantProps} />
									</Card>
								</Col>
							</Row>
						);
					})}
				</div>
			</Form>
		</AnimatedWrapper>
	);
};

export default ManageStock;
