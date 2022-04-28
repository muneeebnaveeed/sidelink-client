import { Menu } from 'antd';
import React from 'react';
import Flex from './Flex';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const SingleDropdownMenu = ({ row, onEdit, onDelete }) => {
	return (
		<Menu>
			<Menu.Item onClick={() => onEdit(row)}>
				<Flex alignItems="center">
					<EditOutlined />
					<span className="ml-2">Edit</span>
				</Flex>
			</Menu.Item>
			<Menu.Item onClick={() => onDelete(row)}>
				<Flex alignItems="center">
					<DeleteOutlined />
					<span className="ml-2">Delete</span>
				</Flex>
			</Menu.Item>
		</Menu>
	);
};

export default SingleDropdownMenu;
