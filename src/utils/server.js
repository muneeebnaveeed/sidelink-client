import axios from 'axios';
import { BASE_URL } from './constants';

const api = axios.create({
	baseURL: BASE_URL,
});

export const get = async (
	path,
	{ params, headers, responseType } = { params: {}, headers: {}, responseType: 'json' }
) => api.get(path, { params, headers, responseType }).then((res) => res.data);

export const post = async (path, payload, { params, headers } = { params: {}, headers: {} }) =>
	api.post(path, payload, { params, headers }).then((res) => res.data);

export const patch = async (path, payload, { params, headers } = { params: {}, headers: {} }) =>
	api.patch(path, payload, { params, headers }).then((res) => res.data);

export const del = async (path, payload, { params, headers } = { params: {}, headers: {} }) =>
	api.delete(path, payload, { params, headers }).then((res) => res.data);
