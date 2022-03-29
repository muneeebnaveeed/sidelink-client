import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import ProductList from './manage-sales';
import AddProduct from './add-sales';
// import EditProduct from './edit-product';
// import Orders from './orders';
const Supplier = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Redirect exact from={`${match.url}`} to={`${match.url}/manage-sales`} />
			{/* <Redirect exact from={`${match.url}`} to={`${match.url}/add-product`} /> */}
			<Route path={`${match.url}/add-sales`} component={AddProduct} />
			{/* <Route path={`${match.url}/edit-product/:id`} component={EditProduct} /> */}
			<Route path={`${match.url}/manage-sales`} component={ProductList} />
			{/* <Route path={`${match.url}/orders`} component={Orders} /> */}
		</Switch>
	);
};

export default Supplier;
