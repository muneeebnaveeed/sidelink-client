import { Button, Col, Form, Input, message, Modal, Progress, Row, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BASE_URL } from 'utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { get, patch, post } from 'utils/server';
import Utils from 'utils';
import { Flex } from 'components/shared-components';
import { useFormik } from 'formik';

const initialValues = { name: '', price: '', sku: '' };

const validateForm = (values) => {
	const errors = {};
	const { name, price, sku } = values;

	if (!name) errors.name = 'Variant name is required';
	else if (name.length < 4) errors.name = 'Minimum of 4 characters are required in product name';

	if (!price) errors.price = 'Variant price is required';

	if (!sku) errors.sku = 'SKU is required';

	return errors;
};

const ManageVariant = ({ visible, data }) => {
	const queryClient = useQueryClient();

	const productState = useMemo(() => data.value?.product, [data.value?.product]);
	const variantState = useMemo(() => data.value?.variant, [data.value?.variant]);

	const addMutation = useMutation((payload) => post('/product_variants', payload), {
		onSuccess: () => {
			message.success('Product variant has been added successfully');
			handleCancel();
			queryClient.invalidateQueries('products');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const updateMutation = useMutation((payload) => patch(`/product_variants/id/${variantState?._id}`, payload), {
		onSuccess: () => {
			message.success('Product variant has been updated successfully');
			handleCancel();
			queryClient.invalidateQueries('products');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const mutation = useMemo(
		() => (variantState ? updateMutation : addMutation),
		[addMutation, updateMutation, variantState]
	);

	const handleSubmit = useCallback(
		(values) => {
			const productId = productState?.product._id;
			const index = productState?.variants.length;
			const payload = { ...values, product: productId, index };
			mutation.mutate(payload);
		},
		[mutation, productState?.product._id, productState?.variants.length]
	);

	const formik = useFormik({
		initialValues,
		validateOnChange: false,
		validateOnMount: false,
		validateOnBlur: true,
		validate: validateForm,
		onSubmit: handleSubmit,
	});

	const [form] = Form.useForm();

	const handleCancel = useCallback(() => {
		if (!mutation.isLoading) {
			data.set(null);
			formik.resetForm();
			visible.set(false);
		}
	}, [mutation.isLoading, visible]);

	const getVariantValidationError = useCallback((key) => formik.errors[key] || null, [formik.errors]);

	const getVariantValidationStatus = useCallback((key) => (formik.errors[key] ? 'error' : null), [formik.errors]);

	const handleChangeVariant = useCallback(
		(key) => (event) => {
			const value = event.target.value;

			if (key === 'name') {
				const sku = Utils.generateSKU(productState?.product.name, value, productState?.variants.length);
				if (sku) formik.setFieldValue('sku', sku);
			}

			formik.setFieldValue(key, value);
		},
		[productState?.product.name, productState?.variants.length]
	);

	const getModalTitle = useCallback(() => {
		if (variantState) return `Edit Variant - ${variantState.name}`;
		return `Add Variant`;
	}, [variantState]);

	useEffect(() => {
		if (visible.value && variantState) {
			const { name, price, sku } = variantState;
			formik.setFieldValue('name', name);
			formik.setFieldValue('price', price);
			formik.setFieldValue('sku', sku);
		}
	}, [visible.value]);

	return (
		<Modal
			title={getModalTitle()}
			visible={visible.value}
			onCancel={handleCancel}
			destroyOnClose
			okText="Save"
			confirmLoading={mutation.isLoading}
			cancelButtonProps={{ disabled: mutation.isLoading }}
			onOk={formik.handleSubmit}
		>
			<Form
				layout="vertical"
				form={form}
				name="add_product_variant_form"
				className="ant-advanced-search-form"
				autoComplete="off"
				onFinish={formik.handleSubmit}
			>
				<button className="hidden" type="submit" />
				<Row>
					<Col xs={24}>
						<Form.Item required label="Product">
							<Input size="small" value={productState?.product.name} disabled />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={24}>
						<Form.Item
							required
							label="Variant name"
							validateStatus={getVariantValidationStatus('name')}
							help={getVariantValidationError('name')}
						>
							<Input size="small" name="name" value={formik.values.name} onChange={handleChangeVariant('name')} />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={18}>
					<Col xs={12}>
						<Form.Item
							required
							label="Price"
							validateStatus={getVariantValidationStatus('price')}
							help={getVariantValidationError('price')}
						>
							<Input size="small" name="price" value={formik.values.price} onChange={handleChangeVariant('price')} />
						</Form.Item>
					</Col>
					<Col xs={12}>
						<Form.Item
							required
							label="SKU"
							validateStatus={getVariantValidationStatus('sku')}
							help={getVariantValidationError('sku')}
						>
							<Input size="small" name="sku" value={formik.values.sku} onChange={handleChangeVariant('sku')} />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default ManageVariant;
