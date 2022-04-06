import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import ProductList from './manage-supplier';
import AddProduct from './add-supplier';
import EditSupplier from './edit-supplier';
// import Orders from './orders';
const Supplier = (props) => {
	const { match } = props;
	return (

		<Switch>
			<Redirect exact from={`${match.url}`} to={`${match.url}/manage-supplier`} />
			{/* <Redirect exact from={`${match.url}`} to={`${match.url}/add-product`} /> */}
			<Route path={`${match.url}/add-supplier`} component={AddProduct} />
			<Route path={`${match.url}/edit-supplier/:id`} component={EditSupplier} />
			<Route path={`${match.url}/manage-supplier`} component={ProductList} />
			{/* <Route path={`${match.url}/orders`} component={Orders} /> */}
		</Switch>
	);
};

export default Supplier;
