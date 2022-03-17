import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import ProductList from './manage-products';
import AddProduct from './add-product';

const Products = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Redirect exact from={`${match.url}`} to={`${match.url}/manage-products`} />
			<Redirect exact from={`${match.url}`} to={`${match.url}/add-product`} />
			<Route path={`${match.url}/add-product`} component={AddProduct} />
			<Route path={`${match.url}/manage-products`} component={ProductList} />
		</Switch>
	);
};

export default Products;
