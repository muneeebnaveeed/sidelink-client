import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Form, Button, message, Space, Row, Col, Card, Input, InputNumber } from 'antd';
import Flex from 'components/shared-components/Flex';
import { patch, post } from 'utils/server';
import { useQueryClient, useMutation } from 'react-query';
import utils from 'utils';
import { useDidMount, useKey } from 'rooks';

const initialValues = {
	name: '',
	phone: '',
};

const rules = {
	name: [
		{
			required: true,
			type: 'string',
			min: 4,
		},
	],
	phone: [],
};

const ManageSupplier = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();

	const [form] = Form.useForm();

	const editingState = useMemo(() => location.state, []);
	const supplierState = useMemo(() => editingState?.supplier, []);

	const handleDiscard = useCallback(history.goBack, []);

	const addMutation = useMutation((payload) => post('/suppliers', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('suppliers');
			history.push(editingState?.from || '/app/contacts', { flashMessage: 'Supplier has been added successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const editProductMutation = useMutation((payload) => patch(`/suppliers/id/${supplierState?._id}`, payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('suppliers');
			history.push('/app/contacts', { flashMessage: 'Supplier has been updated successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const mutation = useMemo(
		() => (supplierState ? editProductMutation : addMutation),
		[addMutation, editProductMutation, supplierState]
	);

	const onFinish = useCallback(() => {
		form.validateFields().then((values) => {
			mutation.mutate({ ...values, type: 'SUPPLIER' });
		});
	}, [form, mutation]);

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		if (supplierState) form.setFieldsValue(supplierState);
	});

	return (
		<>
			<Form
				layout="vertical"
				form={form}
				name="supplier_form"
				className="ant-advanced-search-form"
				initialValues={initialValues}
				autoComplete="off"
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-0">{supplierState ? 'Update Supplier' : `Add New Supplier`}</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Back
									</Button>
									<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={mutation.isLoading}>
										{supplierState ? 'Update Supplier' : 'Add Supplier'}
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
								<Row>
									<Col sm={24}>
										<Form.Item name="name" label="Supplier name" rules={rules.name}>
											<Input />
										</Form.Item>
									</Col>
								</Row>

								<Row gutter={32}>
									<Col sm={24}>
										<Form.Item name="phone" label="Phone" rules={rules.phone}>
											<Input />
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>
				</div>
			</Form>
		</>
	);
};

export default ManageSupplier;
