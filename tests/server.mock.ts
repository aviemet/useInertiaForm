import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data for testing
const mockSuccessData = {
	id: '1',
	name: 'Test Item',
	details: 'Some test details',
};

const mockErrorResponse = {
	errors: {
		users: ['No data found'],
	},
};

export const server = setupServer(
	// Success scenario
	http.post('/api/data', () => {
		return HttpResponse.json(mockSuccessData);
	}),

	// Error scenario
	http.post('/api/data-error', () => {
		return HttpResponse.json(mockErrorResponse, { status: 302 });
	})
)
