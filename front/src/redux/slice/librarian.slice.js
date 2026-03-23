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

const librarianSlice = createSlice({
    name: 'librarian',
    initialState: {
        books: [],
        records: [],
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
            .addCase(issueBookSlice.fulfilled, (state, action) => {
                state.records.unshift(action.payload);
                state.success = 'Book issued';
            })
            .addCase(returnBookSlice.fulfilled, (state, action) => {
                const index = state.records.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.records[index] = action.payload;
                state.success = 'Book returned';
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
