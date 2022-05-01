import { Button, Col, Form, Input, message, Modal, Progress, Row, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BASE_URL } from 'utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { get, patch, post } from 'utils/server';
import Utils from 'utils';
import { Flex } from 'components/shared-components';
import { useFormik } from 'formik';

const initialValues = { quantity: '0' };

const validateForm = (isEditing) => (values) => {
	const errors = {};
	const { quantity } = values;

	const quantityMessage = 'Please enter variant quantity';

	const parsedQuantity = parseInt(quantity);

	if (parsedQuantity < 0) errors.quantity = 'Quantity can not be negative';
	else {
		if (isEditing) {
			if (quantity === '' || quantity === null || quantity === undefined) errors.quantity = quantityMessage;
		} else {
			if (!quantity || parsedQuantity === 0) errors.quantity = quantityMessage;
		}
	}

	return errors;
};

const AddStock = ({ visible, data }) => {
	const queryClient = useQueryClient();

	const [isEditing, setIsEditing] = useState(false);
	const [isConsuming, setIsConsuming] = useState(false);

	const editingState = useMemo(() => data.value, [data.value]);
	const productState = useMemo(() => editingState?.product, [editingState?.product]);
	const stockState = useMemo(() => editingState?.stock, [editingState?.stock]);

	const addMutation = useMutation((payload) => post('/stock', payload), {
		onSuccess: () => {
			message.success('Stock has been added successfully');
			handleCancel();
			queryClient.invalidateQueries('stock');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const consumeMutation = useMutation((payload) => post('/stock/consume', payload), {
		onSuccess: () => {
			message.success('Stock has been consumed successfully');
			handleCancel();
			queryClient.invalidateQueries('stock');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const updateMutation = useMutation((payload) => patch('/stock', payload), {
		onSuccess: () => {
			message.success('Stock has been updated successfully');
			handleCancel();
			queryClient.invalidateQueries('stock');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const mutation = useMemo(
		() => (isEditing ? updateMutation : isConsuming ? consumeMutation : addMutation),
		[isEditing, updateMutation, isConsuming, consumeMutation, addMutation]
	);

	const handleSubmit = useCallback(
		(values) => {
			const productVariant = stockState?.productVariant._id;
			const quantity = values.quantity;
			const payload = { _id: productVariant, quantity };

			mutation.mutate([payload]);
		},
		[mutation, stockState?.productVariant._id]
	);

	const formik = useFormik({
		initialValues,
		validateOnChange: false,
		validateOnMount: false,
		validateOnBlur: true,
		validate: validateForm(isEditing),
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

	const getModalTitle = useCallback(() => {
		if (isEditing) return `Edit Variant Stock`;
		return `Add Variant Stock`;
	}, [isEditing]);

	const getOkText = useCallback(() => {
		if (isEditing) return `Save`;
		return `Add`;
	}, [isEditing]);

	useEffect(() => {
		if (visible.value && editingState) {
			const { isEditing: editing = false, isConsuming: consuming = false } = editingState;

			if (editing) setIsEditing(editing);

			if (consuming) setIsConsuming(consuming);

			if (editing || consuming) {
				const quantity = stockState.quantity;
				formik.setFieldValue('quantity', quantity);
			}
		}
	}, [visible.value]);

	return (
		<Modal
			title={getModalTitle()}
			visible={visible.value}
			onCancel={handleCancel}
			destroyOnClose
			okText={getOkText()}
			confirmLoading={mutation.isLoading}
			cancelButtonProps={{ disabled: mutation.isLoading }}
			onOk={formik.handleSubmit}
		>
			<Form
				layout="vertical"
				form={form}
				name="add_variant_stock_form"
				className="ant-advanced-search-form"
				autoComplete="off"
				onFinish={formik.handleSubmit}
			>
				<button className="hidden" type="submit" />
				<Row>
					<Col xs={24}>
						<Form.Item required label="Product">
							<Input size="small" value={productState?.name} disabled />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={24}>
						<Form.Item required label="Variant">
							<Input size="small" value={stockState?.productVariant.name} disabled />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={18}>
					<Col xs={24}>
						<Form.Item
							required
							label="Quantity"
							validateStatus={getVariantValidationStatus('quantity')}
							help={getVariantValidationError('quantity')}
						>
							<Input size="small" name="quantity" value={formik.values.quantity} onChange={formik.handleChange} />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default AddStock;
