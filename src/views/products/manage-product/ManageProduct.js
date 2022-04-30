import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Form, Button, message, Space, Row, Col, Card, Input, InputNumber, Divider } from 'antd';
import Flex from 'components/shared-components/Flex';
import { patch, post } from 'utils/server';
import { useQueryClient, useMutation } from 'react-query';
import utils from 'utils';
import { useDidMount, useKey } from 'rooks';
import { useFormik } from 'formik';
import Utils from 'utils';
import VariantRow from './VariantRow';

const initialValues = {
	name: '',
	variants: [
		{
			name: '',
			price: '',
			sku: '',
		},
	],
};

const validateForm = (values) => {
	const errors = {};
	const { name, variants } = values;
	if (!name) errors.name = 'Product name is required';
	else if (name.length < 3) errors.name = 'Minimum of 3 characters are required in product name';

	const variantErrors = {};

	variants.forEach((variant, index) => {
		const error = { name: '', price: '', sku: '' };
		if (!variant.name) error.name = 'Variant name is required';
		else if (variant.name.length < 3) error.name = 'Minimum of 3 characters are required in product name';

		if (!variant.price) error.price = 'Variant price is required';

		if (!variant.sku) error.sku = 'SKU is required';

		if (error.name || error.price || error.sku) variantErrors[index] = error;
	});

	if (Object.keys(variantErrors).length) errors.variants = variantErrors;

	return errors;
};

const AddProduct = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();

	const editingState = useMemo(() => location.state, []);
	const productState = useMemo(() => editingState.product, []);

	const handleDiscard = useCallback(history.goBack, []);

	const addProductMutation = useMutation((payload) => post('/products', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('products');
			history.push(editingState.from || '/app/products', { flashMessage: 'Product has been added successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const editProductMutation = useMutation((payload) => patch(`/products/id/${productState._id}`, payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('products');
			history.push('/app/products', { flashMessage: 'Product has been updated successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const mutation = useMemo(
		() => (productState ? editProductMutation : addProductMutation),
		[addProductMutation, editProductMutation, productState]
	);

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		if (productState) {
			const { product, variants } = productState;
			formik.setFieldValue('name', product.name);
			formik.setFieldValue('variants', variants);
		}
	});

	const handleSubmit = useCallback(
		(values) => {
			const payload = { ...values };
			payload.variants.forEach((v, index) => {
				if (v.index === undefined || v.index === null) v.index = index;
			});
			mutation.mutate(payload);
		},
		[mutation]
	);

	const formik = useFormik({
		initialValues,
		validate: validateForm,
		validateOnChange: false,
		validateOnMount: false,
		validateOnBlur: true,
		onSubmit: handleSubmit,
	});

	const handleAddVariant = useCallback(() => {
		const variants = [...formik.values.variants];
		variants.push({ name: '', price: '', sku: '' });
		formik.setFieldValue('variants', variants);
	}, []);

	const updateSKUOfAllVariants = useCallback((productName) => {
		const variants = [...formik.values.variants];
		let newSku = Utils.generateSKU(productName, 'abcd', 0);
		if (newSku) {
			newSku = newSku.split('-');
			variants.forEach((variant) => {
				if (!variant.sku) return;

				const oldSku = variant.sku.split('-');
				oldSku[0] = newSku[0];
				variant.sku = oldSku.join('-');
			});
			formik.setFieldValue('variants', variants);
		}
	}, []);

	const handleChangeName = useCallback((event) => {
		const value = event.target.value;
		updateSKUOfAllVariants(value);
		formik.setFieldValue('name', value);
	}, []);

	return (
		<>
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
							<h2 className="mb-0">{productState ? 'Update Product' : `Add New Product`}</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Back
									</Button>
									<Button type="primary" htmlType="submit" loading={mutation.isLoading}>
										{productState ? 'Update Product' : 'Add Product'}
									</Button>
								</Space>
							</Flex>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container" style={{ marginTop: 120 }}>
					<Row gutter={32}>
						<Col sm={24} md={17}>
							<Card title="Basic Info">
								<Form.Item
									required
									label="Product name"
									validateStatus={formik.errors.name ? 'error' : null}
									help={formik.errors.name}
								>
									<Input name="name" value={formik.values.name} onChange={handleChangeName} />
								</Form.Item>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col sm={24} md={24} lg={17}>
							<Card
								title="Variants & SKUs"
								extra={
									<Button type="link" onClick={handleAddVariant}>
										Add Variant
									</Button>
								}
							>
								<Space direction="vertical" size="small" style={{ width: '100%' }} split={<Divider />}>
									{formik.values.variants.map((variant, index) => {
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

										return <VariantRow {...variantProps} />;
									})}
								</Space>
							</Card>
						</Col>
					</Row>
				</div>
			</Form>
		</>
	);
};

export default AddProduct;
