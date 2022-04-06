import React, { useState, useEffect } from 'react';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';
import { Tabs, Form, Button, message } from 'antd';
import Flex from 'components/shared-components/Flex';
import GeneralField from './GeneralField';
// import VariationField from './VariationField'
// import ShippingField from './ShippingField'
import supplierListData from 'assets/data/product-list.data.json';
import { useMutation } from 'react-query';
import axios from 'axios';
import { patch, post } from 'utils/server';
import { useLocation } from 'react-router-dom';
// import Supplier from '..';

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
	// const [uploadedImg, setImage] = useState('');
	const [uploadLoading, setUploadLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [id, setId] = useState('');

	useEffect(() => {
		if (mode === EDIT) {
			console.log('is edit');
			console.log('props', props);
			const { id } = param;
			// const supplierId = parseInt(id);
			// const supplierData = supplierListData.filter((supplier) => supplier.id === supplierId);
			// const supplier = supplierData[0];
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
				// setImage(imageUrl);
				setUploadLoading(true);
			});
		}
	};

	const addSupplierMutation = useMutation(
		(payload) => {
			return post('/contacts', { ...payload, type: "SUPPLIER" });

		},
		{
			onSuccess: (response) => {
				message.success(`Created  supplier to supplier list`);
			},
			onError: (error) => {
				message.error(error?.response?.data?.data[0] || error.message);
			},
		}
	);


	const editSupplierMutation = useMutation(
		(payload) => {
			return patch(`/contacts/id/${id}`, payload);
		},
		{
			onSuccess: (response) => {
				message.success(`supplier saved`);
			},
			onError: (error) => {
				console.log(error)
				message.error(error?.response?.data?.data[0] || error.message);
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
						addSupplierMutation.mutate(values);
					}
					if (mode === EDIT) {
						editSupplierMutation.mutate(values)
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
							<h2 className="mb-3">{mode === 'ADD' ? 'Add New Supplier' : `Edit Supplier`} </h2>
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
						// uploadedImg={uploadedImg}
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
