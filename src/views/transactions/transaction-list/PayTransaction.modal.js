import { Button, Col, Form, Input, message, Modal, Progress, Row, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BASE_URL } from 'utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { get, patch, post } from 'utils/server';
import Utils from 'utils';
import { Flex } from 'components/shared-components';
import { useFormik } from 'formik';

const initialValues = { total: '', paid: '', pay: '' };

const validateForm = (values) => {
	const errors = {};
	const { pay } = values;

	if (pay === '' || pay === null || pay === undefined) errors.pay = 'Please enter the pay amount';

	return errors;
};

const PayTransaction = ({ visible, data }) => {
	const queryClient = useQueryClient();

	const mutation = useMutation((payload) => post(`/transactions/id/${data.value._id}/pay/amount/${payload}`, payload), {
		onSuccess: () => {
			message.success('Transaction has been paid successfully');
			handleCancel();
			queryClient.invalidateQueries('transactions');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const handleSubmit = useCallback(
		(values) => {
			mutation.mutate(values.pay);
		},
		[mutation]
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

	useEffect(() => {
		if (visible.value && data.value) {
			const { total, paid } = data.value;

			const remaining = total - paid;

			formik.setFieldValue('pay', remaining);
		}
	}, [visible.value]);

	return (
		<Modal
			title="Pay Transaction"
			visible={visible.value}
			onCancel={handleCancel}
			destroyOnClose
			okText="Pay"
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
						<Form.Item required label="Total">
							<Input size="small" value={data.value?.total} disabled />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={24}>
						<Form.Item required label="Paid">
							<Input size="small" value={data.value?.paid} disabled />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={24}>
						<Form.Item
							required
							label="Pay"
							validateStatus={getVariantValidationStatus('pay')}
							help={getVariantValidationError('pay')}
						>
							<Input size="small" name="pay" value={formik.values.pay} onChange={formik.handleChange} />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default PayTransaction;
