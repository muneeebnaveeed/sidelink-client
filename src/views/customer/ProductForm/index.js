import React, { useState, useEffect } from 'react';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Tabs, Form, Button, message } from 'antd';
import Flex from 'components/shared-components/Flex';
import GeneralField from './GeneralField';
// import VariationField from './VariationField'
// import ShippingField from './ShippingField'
import contactsListData from 'assets/data/product-list.data.json';
import { useMutation } from 'react-query';
import axios from 'axios';
import { patch, post } from 'utils/server';
import { useLocation } from 'react-router-dom';

const { TabPane } = Tabs;

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
};

const ADD = 'ADD';
const EDIT = 'EDIT';

const ProductForm = (props) => {
	const location = useLocation();
	const { mode = ADD, param } = props;

	const [form] = Form.useForm();
	const [uploadedImg, setImage] = useState('');
	const [uploadLoading, setUploadLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [id, setId] = useState('');

	useEffect(() => {
		if (mode === EDIT) {
			console.log('is edit');
			console.log('props', props);
			const { id } = param;
			// const contactId = parseInt(id);
			// const contactsData = contactsListData.filter((contacts) => contacts.id === contactId);
			// const contacts = contactsData[0];
			form.setFieldsValue({
				name: location.state?.name,
				phone: location.state?.phone,
			});

			setId(id);
		}
	}, [form, mode, param, props]);

	const handleUploadChange = (info) => {
		if (info.file.status === 'uploading') {
			setUploadLoading(true);
			return;
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj, (imageUrl) => {
				setImage(imageUrl);
				setUploadLoading(true);
			});
		}
	};

	const addCustomerMutation = useMutation(
		(payload) => {
			return post('/contacts', { ...payload, type: 'CUSTOMER' });
		},
		{
			onSuccess: (response) => {
				message.success(`Created  customer to customer list`);
			},
			onError: (error) => {
				message.error(utils.getErrorMessages(error));
			},
		}
	);

	const onFinish = () => {
		setSubmitLoading(true);
		form
			.validateFields()
			.then((values) => {
				setTimeout(() => {
					setSubmitLoading(false);
					if (mode === ADD) {
						console.log({ values });
						addCustomerMutation.mutate(values);
					}
					if (mode === EDIT) {
						message.success(`customer saved`);
					}
				}, 1500);
			})
			.catch((info) => {
				setSubmitLoading(false);
				console.log('info', info);
				message.error('Please enter all required field ');
			});
	};

	return (
		<>
			<Form
				layout="vertical"
				form={form}
				name="advanced_search"
				className="ant-advanced-search-form"
				initialValues={{
					heightUnit: 'cm',
					widthUnit: 'cm',
					weightUnit: 'kg',
				}}
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-3">{mode === 'ADD' ? 'Add New Customer' : `Edit Customer`} </h2>
							<div className="mb-3">
								<Button className="mr-2">Discard</Button>
								<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={submitLoading}>
									{mode === 'ADD' ? 'Add' : `Save`}
								</Button>
							</div>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container" style={{ marginTop: 30 }}>
					{/* <Tabs defaultActiveKey="1" style={{ marginTop: 30 }}> */}
					{/* <TabPane tab="General" key="1"> */}
					<GeneralField
						uploadedImg={uploadedImg}
						uploadLoading={uploadLoading}
						handleUploadChange={handleUploadChange}
					/>
					{/* </TabPane> */}
					{/* <TabPane tab="Variation" key="2">
							<VariationField />
						</TabPane>
						<TabPane tab="Shipping" key="3">
							<ShippingField />
						</TabPane> */}
					{/* </Tabs> */}
				</div>
			</Form>
		</>
	);
};

export default ProductForm;
