import { Button, message, Modal, Progress, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useCallback, useMemo, useState } from 'react';
import { BASE_URL } from 'utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { get, post } from 'utils/server';
import Utils from 'utils';
import { Flex } from 'components/shared-components';

const BulkImport = ({ visible }) => {
	const queryClient = useQueryClient();

	const [selectedCSV, setSelectedCSV] = useState([]);

	const uploadMutation = useMutation((payload) => post('/customers/bulk', payload), {
		onSuccess: () => {
			message.success('Customers have been imported successfully');
			handleCancel();
			queryClient.invalidateQueries('customers');
		},
		onError: (err) => {
			message.error(Utils.getErrorMessages(err));
		},
	});

	const downloadSampleMutation = useMutation(() => get('/customers/sample', { responseType: 'blob' }), {
		onSuccess: (blob) => {
			Utils.downloadBlob(blob, 'sample_customers.csv');
			message.success('Sample CSV has been downloaded successfully');
		},
		onError: (error) => {
			message.error(Utils.getErrorMessages(error));
		},
	});

	const handleCancel = useCallback(() => {
		if (!uploadMutation.isLoading && !downloadSampleMutation.isLoading) {
			setSelectedCSV([]);
			visible.set(false);
		}
	}, [downloadSampleMutation.isLoading, uploadMutation.isLoading, visible]);

	const handleRemoveCSV = useCallback(() => {
		setSelectedCSV([]);
	}, []);

	const handleSelectCSV = useCallback((file) => {
		if (file.type !== 'text/csv') {
			message.error('Invalid file type: only CSV are supported currently');
			return false;
		}

		setSelectedCSV([file]);
		return false;
	}, []);

	const handleImport = useCallback(() => {
		const form = new FormData();
		form.append('file', selectedCSV[0]);
		uploadMutation.mutate(form);
	}, [selectedCSV, uploadMutation]);

	const draggerProps = useMemo(
		() => ({
			name: 'customers',
			accept: 'text/csv',
			maxCount: 1,
			multiple: false,
			beforeUpload: handleSelectCSV,
			onRemove: handleRemoveCSV,
			fileList: selectedCSV,
		}),
		[handleRemoveCSV, handleSelectCSV, selectedCSV]
	);

	return (
		<Modal
			title="Import Customers"
			visible={visible.value}
			onCancel={handleCancel}
			destroyOnClose
			footer={[
				<Flex justifyContent="between" alignItems="center" className="w-100">
					<Button type="link" onClick={downloadSampleMutation.mutate} disabled={downloadSampleMutation.isLoading}>
						Download Sample CSV
					</Button>
					<Space>
						<Button
							type="secondary"
							disabled={uploadMutation.isLoading || downloadSampleMutation.isLoading}
							onClick={handleCancel}
						>
							Cancel
						</Button>

						<Button
							type="primary"
							loading={uploadMutation.isLoading || downloadSampleMutation.isLoading}
							onClick={handleImport}
						>
							Import
						</Button>
					</Space>
				</Flex>,
			]}
		>
			<Upload.Dragger {...draggerProps}>
				<p className="ant-upload-drag-icon">
					<UploadOutlined />
				</p>
				<p className="ant-upload-text">Click or drag file to this area to upload</p>
				<p className="ant-upload-hint">Support for a single CSV upload.</p>
			</Upload.Dragger>
		</Modal>
	);
};

export default BulkImport;
