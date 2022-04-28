import { APP_PREFIX_PATH } from 'configs/AppConfig';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ContactList from './contact-list/ContactList';
import ManageCustomer from './manage-customer/ManageCustomer';
import ManageSupplier from './manage-supplier/ManageSupplier';

const Contacts = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={ContactList} />
			<Route path={`${match.url}/suppliers/manage`} component={ManageSupplier} />
			<Route path={`${match.url}/customers/manage`} component={ManageCustomer} />
		</Switch>
	);
};

export default Contacts;
