import axios from 'axios';

const api = axios.create({
	baseURL: 'https://sidelink-backend.herokuapp.com',
});

export const get = async (path, { params, headers } = { params: {}, headers: {} }) =>
	api.get(path, { params, headers }).then((res) => res.data);
