import { Menu } from 'antd';
import React from 'react';
import Flex from './Flex';

import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const BulkActionDropdownMenu = ({ onImportCSV, onDelete, canDelete, onDeleteAll, canDeleteAll }) => {
	return (
		<Menu>
			<Menu.Item onClick={onImportCSV}>
				<Flex alignItems="center">
					<UploadOutlined />
					<span className="ml-2">Import CSV</span>
				</Flex>
			</Menu.Item>
			<Menu.Item onClick={onDeleteAll} disabled={!canDeleteAll}>
				<Flex alignItems="center">
					<DeleteOutlined />
					<span className="ml-2">Delete All</span>
				</Flex>
			</Menu.Item>
			<Menu.Item onClick={onDelete} disabled={!canDelete}>
				<Flex alignItems="center">
					<DeleteOutlined />
					<span className="ml-2">Delete Selected</span>
				</Flex>
			</Menu.Item>
		</Menu>
	);
};

export default BulkActionDropdownMenu;
