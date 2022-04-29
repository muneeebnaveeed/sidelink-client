import React from 'react';
import { Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const EllipsisDropdown = ({ menu, ...props }) => {
	return (
		<Dropdown overlay={menu} {...props}>
			<div className="ellipsis-dropdown">
				<EllipsisOutlined />
			</div>
		</Dropdown>
	);
};

EllipsisDropdown.propTypes = {
	trigger: PropTypes.string,
	placement: PropTypes.string,
};

EllipsisDropdown.defaultProps = {
	trigger: ['click'],
	placement: 'bottomRight',
	menu: <Menu />,
};

export default EllipsisDropdown;
