export const multiRootData = {
	user: {
		username: "some name",
	},
	person: {
		first_name: "first",
		last_name: "last",
		middle_name: undefined,
		nested: {
			key: "value",
		},
	},
	contact: {
		phones: [
			{ number: "1234567890", type: "home" },
			{ number: "2234567890", type: "home" },
			{ number: "3234567890", type: "home" },
		],
	},
}

export const singleRootData = {
	person: {
		first_name: "first",
		last_name: "last",
		middle_name: undefined,
		nested: {
			key: "value",
		},
	},
}

export const flatData = {
	first_name: "first",
	last_name: "last",
	middle_name: undefined,
	nested: {
		key: "value",
	},
}
