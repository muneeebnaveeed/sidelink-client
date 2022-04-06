import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import ProductList from './manage-customer';
import AddProduct from './add-customer';
import EditProduct from './edit-customer';
// import Orders from './orders';
const Supplier = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Redirect exact from={`${match.url}`} to={`${match.url}/manage-customer`} />
			{/* <Redirect exact from={`${match.url}`} to={`${match.url}/add-product`} /> */}
			<Route path={`${match.url}/add-customer`} component={AddProduct} />
			<Route path={`${match.url}/edit-product/:id`} component={EditProduct} />
			<Route path={`${match.url}/manage-customer`} component={ProductList} />
			{/* <Route path={`${match.url}/orders`} component={Orders} /> */}
		</Switch>
	);
};

export default Supplier;
