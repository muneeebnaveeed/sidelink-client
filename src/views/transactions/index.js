import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ManagePurchase from './manage-purchase/ManagePurchase';
import ManageSale from './manage-sale/ManageSale';

import TransactionList from './transaction-list/TransactionList';

const Stock = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={TransactionList} />

			<Route path={`${match.url}/purchases/manage`} exact component={ManagePurchase} />
			<Route path={`${match.url}/sales/manage`} exact component={ManageSale} />
		</Switch>
	);
};

export default Stock;
