import React from 'react';
import { Route, Switch } from 'react-router-dom';
import EmployeeList from './employee-list/EmployeeList';
import ManageEmployee from './manage-employee/ManageEmployee';

const Employees = (props) => {
	const { match } = props;
	return (
		<Switch>
			<Route path={`${match.url}/`} exact component={EmployeeList} />
			<Route path={`${match.url}/manage`} exact component={ManageEmployee} />
		</Switch>
	);
};

export default Employees;
