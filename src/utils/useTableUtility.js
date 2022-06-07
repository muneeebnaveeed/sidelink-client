import { useMemo, useState } from 'react';
import { useDebouncedValue } from 'rooks';
import moment from 'moment';

const getDateOnly = ($date = new Date()) => {
	const date = $date.getDate();
	const month = $date.getMonth() + 1;
	const year = $date.getFullYear();

	return `${year}-${month}-${date}`;
};

const useTableUtility = ({ page, limit } = { page: 1, limit: 10 }) => {
	const [p, setPage] = useState(page);
	const [l, setLimit] = useState(limit);
	const [sort, setSort] = useState({ undefined: -1 });
	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebouncedValue(search, 500);
	const [startDate, setStartDate] = useState(moment(getDateOnly()));
	const [endDate, setEndDate] = useState(moment(getDateOnly()));

	const value = useMemo(
		() => ({
			limit: {
				value: l,
				set: setLimit,
			},
			page: {
				value: p,
				set: setPage,
			},
			sort: {
				value: sort,
				set: setSort,
			},
			search: {
				debounced: debouncedSearch,
				value: search,
				set: setSearch,
			},
			startDate: {
				value: startDate,
				set: setStartDate,
			},
			endDate: {
				value: endDate,
				set: setEndDate,
			},
		}),
		[debouncedSearch, endDate, l, p, search, sort, startDate]
	);

	return value;
};

export default useTableUtility;
