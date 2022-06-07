import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Form, Button, message, Space, Row, Col, Card, Input, InputNumber } from 'antd';
import Flex from 'components/shared-components/Flex';
import { patch, post } from 'utils/server';
import { useQueryClient, useMutation } from 'react-query';
import utils from 'utils';
import { useDidMount, useKey } from 'rooks';
import { AnimatedWrapper } from 'components/shared-components';

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

const ManageCustomer = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();

	const [form] = Form.useForm();

	const editingState = useMemo(() => location.state, [location.state]);
	const customerState = useMemo(() => editingState?.customer, [editingState?.customer]);

	const handleDiscard = useCallback(history.goBack, []);

	const addMutation = useMutation((payload) => post('/customers', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('customers');
			history.push(editingState?.from || '/app/contacts', { flashMessage: 'Customer has been added successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const editProductMutation = useMutation((payload) => patch(`/customers/id/${customerState?._id}`, payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('customers');
			history.push('/app/contacts', { flashMessage: 'Customer has been updated successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const mutation = useMemo(
		() => (customerState ? editProductMutation : addMutation),
		[addMutation, editProductMutation, customerState]
	);

	const onFinish = useCallback(() => {
		form.validateFields().then((values) => {
			mutation.mutate({ ...values, type: 'CUSTOMER' });
		});
	}, [form, mutation]);

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		if (customerState) form.setFieldsValue(customerState);
	});

	return (
		<AnimatedWrapper>
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
							<h2 className="mb-0">{customerState ? 'Update Customer' : `Add New Customer`}</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Back
									</Button>
									<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={mutation.isLoading}>
										{customerState ? 'Update Customer' : 'Add Customer'}
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
										<Form.Item name="name" label="Customer name" rules={rules.name}>
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
		</AnimatedWrapper>
	);
};

export default ManageCustomer;
