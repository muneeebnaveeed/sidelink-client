import { Button, Card, Space, Table, Typography } from 'antd';
import Column from 'antd/lib/table/Column';
import React, { Component } from 'react';
import NumberFormat from 'react-number-format';
import { invoiceData } from 'views/app-views/pages/invoice/invoiceData';
import dayjs from 'dayjs';
import { Flex } from 'components/shared-components';

class Invoice extends Component {
	render() {
		const { transaction, products } = this.props;

		return (
			<Card className="print-only">
				<Flex style={{ height: 'calc(100vh - 50px)' }} flexDirection="column" justifyContent="between">
					<div>
						<div className="d-md-flex justify-content-md-between">
							<div>
								<img src="/img/logo.png" className="mb-2" alt="" />
								<address>
									<p>
										<span className="font-weight-semibold text-dark font-size-md">Sidelink, Inc.</span>
										<br />
										<span>Lane 14, Phase II, Wah Model Town</span>
										<br />
										<span>Wah, Pakistan</span>
										<br />
										<Space>
											<abbr className="text-dark" title="Phone">
												Phone:
											</abbr>
											<span>+92 308 5615517</span>
										</Space>
									</p>
								</address>
							</div>
							<div className="mt-3 text-right">
								<h2 className="mb-1 font-weight-semibold">Invoice #{transaction?.sr ?? '???'}</h2>
								<p>{dayjs(transaction?.createdAt).format('D MMM YYYY h:mm A')}</p>
								<address>
									<p>
										<span className="font-weight-semibold text-dark font-size-md">
											{transaction?.contact.name ?? '???'}
										</span>
										<br />
										<span>{transaction?.contact.phone}</span>
										{/* <br />
								<span>Niagara Falls, New York 14304</span> */}
									</p>
								</address>
							</div>
						</div>
						<div className="mt-4">
							<Table dataSource={products} pagination={false} className="mb-5">
								<Column title="#" render={(elm, row, index) => <div>{index + 1}</div>} />
								<Column
									title="Product"
									render={(elm, row) => (
										<Space>
											<Typography.Text strong>{row.productVariant.product.name}</Typography.Text>
											<Typography.Text type="secondary">{row.productVariant.name}</Typography.Text>
										</Space>
									)}
								/>
								<Column title="Quantity" dataIndex="quantity" key="quantity" />
								<Column
									title="Price"
									dataIndex={['productVariant', 'price']}
									render={(price) => (
										<NumberFormat
											displayType={'text'}
											value={price}
											prefix={'PKR '}
											thousandsGroupStyle="lakh"
											thousandSeparator
										/>
									)}
								/>
								<Column
									title="Total"
									render={(elm, row) => (
										<NumberFormat
											displayType={'text'}
											value={row.quantity * row.productVariant.price}
											prefix={'PKR '}
											thousandsGroupStyle="lakh"
											thousandSeparator
										/>
									)}
								/>
							</Table>
							<div className="d-flex justify-content-end">
								<div className="text-right ">
									<div className="border-bottom">
										<p className="mb-2">
											<Space>
												<Typography.Text strong>Subtotal:</Typography.Text>
												<NumberFormat
													displayType={'text'}
													value={transaction?.subtotal}
													prefix={'PKR '}
													thousandsGroupStyle="lakh"
													thousandSeparator
												/>
											</Space>
										</p>
										<p className="mb-2">
											<Space>
												<Typography.Text strong>Discount:</Typography.Text>
												<NumberFormat
													displayType={'text'}
													value={transaction?.discount}
													suffix={'%'}
													thousandSeparator
												/>
											</Space>
										</p>
										<p className="mb-2">
											<Space>
												<Typography.Text strong>Total:</Typography.Text>
												<NumberFormat
													displayType={'text'}
													value={transaction?.total}
													prefix={'PKR '}
													thousandsGroupStyle="lakh"
													thousandSeparator={true}
												/>
											</Space>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<Typography.Text className="text-center">
						Software Developed by Muneeb Naveed - +92 308 5615517
					</Typography.Text>
				</Flex>
			</Card>
		);
	}
}

export default Invoice;
