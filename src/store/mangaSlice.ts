import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MangaEntity } from '../lib/types';
import { fetchMangaSection, fetchSimilarManga, fetchMangaDetail } from '../lib/mangaApi';

export interface MangaState {
  popular: MangaEntity[];
  trending: MangaEntity[];
  topRated: MangaEntity[];
  newReleases: MangaEntity[];
  currentPage: number;
  total: number;
  limit: number;
  offset: number;
  loading: boolean;
  error: string | null;
}

const initialState: MangaState = {
  popular: [],
  trending: [],
  topRated: [],
  newReleases: [],
  currentPage: 1,
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null,
};

export const fetchPopular = createAsyncThunk(
  'manga/fetchPopular',
  async (page: number) => {
    return await fetchMangaSection('popular', page);
  }
);

export const fetchTrending = createAsyncThunk(
  'manga/fetchTrending',
  async (page: number) => {
    return await fetchMangaSection('trending', page);
  }
);

export const fetchTopRated = createAsyncThunk(
  'manga/fetchTopRated',
  async (page: number) => {
    return await fetchMangaSection('topRated', page);
  }
);

export const fetchNewReleases = createAsyncThunk(
  'manga/fetchNewReleases',
  async (page: number) => {
    return await fetchMangaSection('newReleases', page);
  }
);

const mangaSlice = createSlice({
  name: 'manga',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
      state.offset = (action.payload - 1) * state.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopular.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchPopular.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch popular manga.';
      })
      .addCase(fetchTrending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trending manga.';
      })
      .addCase(fetchTopRated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopRated.fulfilled, (state, action) => {
        state.loading = false;
        state.topRated = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchTopRated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch top rated manga.';
      })
      .addCase(fetchNewReleases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewReleases.fulfilled, (state, action) => {
        state.loading = false;
        state.newReleases = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchNewReleases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch new releases.';
      });
  },
});

export const { setPage } = mangaSlice.actions;
export default mangaSlice.reducer;
