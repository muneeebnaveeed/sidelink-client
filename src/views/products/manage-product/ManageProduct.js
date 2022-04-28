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
	sku: '',
	price: '',
};

const rules = {
	name: [
		{
			required: true,
			message: 'Please enter product name',
			type: 'string',
			min: 4,
		},
	],
	sku: [],
	price: [
		{
			required: true,
			message: 'Please enter product price',
			type: 'number',
			min: 1,
		},
	],
};

const AddProduct = (props) => {
	const location = useLocation();
	const history = useHistory();
	const queryClient = useQueryClient();

	const [form] = Form.useForm();

	const editingState = useMemo(() => location.state, []);

	const handleDiscard = useCallback(() => history.push('/app/products'), []);

	const addProductMutation = useMutation((payload) => post('/products', payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('products');
			history.push('/app/products', { flashMessage: 'Product has been added successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const editProductMutation = useMutation((payload) => patch(`/products/id/${editingState._id}`, payload), {
		onSuccess: async () => {
			await queryClient.invalidateQueries('products');
			history.push('/app/products', { flashMessage: 'Product has been updated successfully' });
		},
		onError: (error) => {
			message.error(utils.getErrorMessages(error));
		},
	});

	const mutation = useMemo(
		() => (editingState ? editProductMutation : addProductMutation),
		[addProductMutation, editProductMutation, editingState]
	);

	const onFinish = useCallback(() => {
		form.validateFields().then((values) => {
			mutation.mutate(values);
		});
	}, [form, mutation]);

	useKey(['Escape'], handleDiscard);

	useDidMount(() => {
		if (editingState) form.setFieldsValue(editingState);
	});

	return (
		<>
			<Form
				layout="vertical"
				form={form}
				name="product_form"
				className="ant-advanced-search-form"
				initialValues={initialValues}
				autoComplete="off"
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-0">{editingState ? 'Update Product' : `Add New Product`}</h2>
							<Flex alignItems="center">
								<Space>
									<Button className="mr-2" onClick={handleDiscard} disabled={mutation.isLoading}>
										Discard
									</Button>
									<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={mutation.isLoading}>
										{editingState ? 'Update Product' : 'Add Product'}
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
										<Form.Item name="name" label="Product name" rules={rules.name}>
											<Input />
										</Form.Item>
									</Col>
								</Row>

								<Row gutter={32}>
									<Col sm={24} md={12}>
										<Form.Item name="price" label="Price" rules={rules.price}>
											<InputNumber
												className="w-100"
												formatter={(value) => value.replace(/(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g, '$1,')}
												parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
											/>
										</Form.Item>
									</Col>
									<Col sm={24} md={12}>
										<Form.Item name="sku" label="SKU" rules={rules.sku}>
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

export default AddProduct;
