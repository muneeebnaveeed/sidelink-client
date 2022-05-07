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
	salary: 0,
};

const rules = {
	name: [
		{
			required: true,
			message: 'Please enter employee name',
		},
		{
			type: 'string',
			message: 'Invalid employee name',
		},
		{ min: 4, message: 'Atleast 4 characters are required in employee name' },
	],
	phone: [],
	salary: [
		{
			required: true,
			message: 'Please enter employee salary',
		},
	],
};

const ManageEmployee = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();

	const [form] = Form.useForm();

	const editingState = useMemo(() => location.state, [location.state]);
	const employeeState = useMemo(() => editingState?.customer, [editingState?.customer]);

	const handleDiscard = useCallback(history.goBack, []);

	const addMutation = useMutation((payload) => post('/employees', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('employees');
			history.push(editingState?.from || '/app/employees', { flashMessage: 'Employee has been added successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const editProductMutation = useMutation((payload) => patch(`/employees/id/${employeeState?._id}`, payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('employees');
			history.push('/app/employees', { flashMessage: 'Employee has been updated successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const mutation = useMemo(
		() => (employeeState ? editProductMutation : addMutation),
		[addMutation, editProductMutation, employeeState]
	);

	const onFinish = useCallback(() => {
		form.validateFields().then(mutation.mutate);
	}, [form, mutation]);

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		if (employeeState) form.setFieldsValue(employeeState);
	});

	return (
		<>
			<Form
				layout="vertical"
				form={form}
				name="employee_form"
				className="ant-advanced-search-form"
				initialValues={initialValues}
				autoComplete="off"
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-0">{employeeState ? 'Update Employee' : `Add New Employee`}</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Back
									</Button>
									<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={mutation.isLoading}>
										{employeeState ? 'Update Employee' : 'Add Employee'}
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
										<Form.Item name="name" label="Employee name" rules={rules.name}>
											<Input />
										</Form.Item>
									</Col>
								</Row>

								<Row gutter={32}>
									<Col sm={12}>
										<Form.Item name="phone" label="Phone" rules={rules.phone}>
											<Input />
										</Form.Item>
									</Col>

									<Col sm={12}>
										<Form.Item name="salary" label="Salary" rules={rules.salary}>
											<Input type="number" />
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

export default ManageEmployee;
