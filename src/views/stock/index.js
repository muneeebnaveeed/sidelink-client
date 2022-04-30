import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ManageStock from './manage-stock/ManageStock';
import StockList from './stock-list/StockList';

const Stock = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={StockList} />
			<Route path={`${match.url}/manage`} exact component={ManageStock} />
		</Switch>
	);
};

export default Stock;
