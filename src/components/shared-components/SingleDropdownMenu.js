import { Menu } from 'antd';
import React from 'react';
import Flex from './Flex';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const SingleDropdownMenu = ({ row, onEdit, onDelete, canDelete = true }) => {
	return (
		<Menu>
			<Menu.Item onClick={() => onEdit(row)}>
				<Flex alignItems="center">
					<EditOutlined />
					<span className="ml-2">Edit</span>
				</Flex>
			</Menu.Item>
			{!!onDelete && (
				<Menu.Item onClick={() => onDelete(row)} disabled={!canDelete}>
					<Flex alignItems="center">
						<DeleteOutlined />
						<span className="ml-2">Delete</span>
					</Flex>
				</Menu.Item>
			)}
		</Menu>
	);
};

export default SingleDropdownMenu;
