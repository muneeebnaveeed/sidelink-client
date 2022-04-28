import React from 'react';
import { Row, Col } from 'antd';
import SupplierList from '../supplier-list/SupplierList';
import CustomerList from '../customer-list/CustomerList';

const ContactList = () => {
	return (
		<Row gutter={26}>
			<Col xs={24} sm={24} md={24} lg={24} xl={12}>
				<SupplierList />
			</Col>
			<Col xs={24} sm={24} md={24} lg={24} xl={12}>
				<CustomerList />
			</Col>
		</Row>
	);
};

export default ContactList;
