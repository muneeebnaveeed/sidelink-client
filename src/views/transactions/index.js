import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ManagePurchase from './manage-purchase/ManagePurchase';
import ManageStock from './manage-purchase/ManagePurchase';
import TransactionList from './transaction-list/TransactionList';

const Stock = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={TransactionList} />
			<Route path={`${match.url}/manage`} exact component={ManageStock} />

			<Route path={`${match.url}/purchases/manage`} exact component={ManagePurchase} />
		</Switch>
	);
};

export default Stock;
