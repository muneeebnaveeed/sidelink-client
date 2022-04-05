import axios from 'axios';

const api = axios.create({
	baseURL: 'https://sidelink-backend.herokuapp.com',
});

export const get = async (path, { params, headers } = { params: {}, headers: {} }) =>
	api.get(path, { params, headers }).then((res) => res.data);

export const post = async (path, payload, { params, headers } = { params: {}, headers: {} }) =>
	api.post(path, payload, { params, headers }).then((res) => res.data);

export const patch = async (path, payload, { params, headers } = { params: {}, headers: {} }) =>
	api.patch(path, payload, { params, headers }).then((res) => res.data);

export const del = async (path, payload, { params, headers } = { params: {}, headers: {} }) =>
	api.delete(path, payload, { params, headers }).then((res) => res.data);
