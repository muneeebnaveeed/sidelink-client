import React from 'react';
import { Row, Col, message } from 'antd';
import SupplierList from '../supplier-list/SupplierList';
import CustomerList from '../customer-list/CustomerList';
import { useDidMount } from 'rooks';
import Utils from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
import { AnimatedWrapper } from 'components/shared-components';

const ContactList = () => {
	const history = useHistory();
	const location = useLocation();

	useDidMount(() => {
		Utils.showFlashMessage(history, location, message);
	});

	return (
		<AnimatedWrapper>
			<Row gutter={26}>
				<Col xs={24} sm={24} md={24} lg={24} xl={12}>
					<SupplierList />
				</Col>
				<Col xs={24} sm={24} md={24} lg={24} xl={12}>
					<CustomerList />
				</Col>
			</Row>
		</AnimatedWrapper>
	);
};

export default ContactList;
