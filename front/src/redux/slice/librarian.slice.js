import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchBooksSlice = createAsyncThunk(
    'librarian/fetchBooks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/librarian/books');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const addBookSlice = createAsyncThunk(
    'librarian/addBook',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/librarian/books', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateBookSlice = createAsyncThunk(
    'librarian/updateBook',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/librarian/books/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const deleteBookSlice = createAsyncThunk(
    'librarian/deleteBook',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/librarian/books/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const issueBookSlice = createAsyncThunk(
    'librarian/issueBook',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/librarian/issue', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const returnBookSlice = createAsyncThunk(
    'librarian/returnBook',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/librarian/return/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchRecordsSlice = createAsyncThunk(
    'librarian/fetchRecords',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/librarian/records');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchHistorySlice = createAsyncThunk(
    'librarian/fetchHistory',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/librarian/history', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchBorrowersSlice = createAsyncThunk(
    'librarian/fetchBorrowers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/librarian/borrowers');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchCategoriesSlice = createAsyncThunk(
    'librarian/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/librarian/categories');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const renewBookSlice = createAsyncThunk(
    'librarian/renewBook',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/librarian/renew/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const collectFineSlice = createAsyncThunk(
    'librarian/collectFine',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/librarian/fine/${id}`, { status });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const librarianSlice = createSlice({
    name: 'librarian',
    initialState: {
        books: [],
        records: [], // Active issues
        history: [], // Full history 
        borrowers: [], // Students/Teachers
        categories: [],
        loading: false,
        error: null,
        success: null
    },
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBooksSlice.fulfilled, (state, action) => {
                state.books = action.payload;
            })
            .addCase(addBookSlice.fulfilled, (state, action) => {
                state.books.unshift(action.payload);
                state.success = 'Book added';
            })
            .addCase(updateBookSlice.fulfilled, (state, action) => {
                const index = state.books.findIndex(b => b._id === action.payload._id);
                if (index !== -1) state.books[index] = action.payload;
                state.success = 'Book updated';
            })
            .addCase(deleteBookSlice.fulfilled, (state, action) => {
                state.books = state.books.filter(b => b._id !== action.payload);
                state.success = 'Book deleted';
            })
            .addCase(fetchRecordsSlice.fulfilled, (state, action) => {
                state.records = action.payload;
            })
            .addCase(fetchHistorySlice.fulfilled, (state, action) => {
                state.history = action.payload;
            })
            .addCase(fetchBorrowersSlice.fulfilled, (state, action) => {
                state.borrowers = action.payload;
            })
            .addCase(fetchCategoriesSlice.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            .addCase(issueBookSlice.fulfilled, (state, action) => {
                state.records.unshift(action.payload);
                state.success = 'Book issued successfully';
            })
            .addCase(returnBookSlice.fulfilled, (state, action) => {
                const index = state.records.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.records.splice(index, 1); // Remove from active
                }
                state.history.unshift(action.payload); // Add to history
                state.success = 'Book returned successfully';
            })
            .addCase(renewBookSlice.fulfilled, (state, action) => {
                const index = state.records.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.records[index] = action.payload;
                state.success = 'Book renewed';
            })
            .addCase(collectFineSlice.fulfilled, (state, action) => {
                const hIndex = state.history.findIndex(r => r._id === action.payload._id);
                if (hIndex !== -1) state.history[hIndex] = action.payload;
                state.success = 'Fine status updated';
            })
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { clearStatus } = librarianSlice.actions;
export default librarianSlice.reducer;
