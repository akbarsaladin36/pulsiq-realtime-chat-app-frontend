import axiosApi from "@/utils/axios";
import { create } from "zustand";

const useUsersStore = create((set, get) => ({
    users: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    },
    userDetail: null,
    search: "",
    error: null,
    loading: false,

    GetUsersPaginate: async (isLoadMore = false) => {
        const { pagination, search, users } = get();
        set({ loading: true });
        try {
            const res = await axiosApi.get("user/users", {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search,
                },
            });
            const result = res.data.data;
            set({
                users: isLoadMore ? [...users, ...result.data] : result.data,
                pagination: result.pagination,
                error: null,
                loading: false
            });
        } catch(error) {
            set({ error: error, loading: false })
        }
    },

    setSearch: (value) => set({ search: value }),

    nextPage: async () => {
        const { pagination } = get();

        if (pagination.page >= pagination.total_pages) return;

        set((state) => ({
            pagination: {
                ...state.pagination,
                page: state.pagination.page + 1,
            },
        }));
        await get().GetUsersPaginate(true);
    },

    resetAndFetch: async () => {
        set({
            users: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                total_pages: 0,
            },
        });
        await get().GetUsersPaginate(false);
    },

    GetUser: async (username) => {
        set({ loading: true})
        try {
            const res = await axiosApi.get(`admin/users/${username}`)
            set({ userDetail: res.data.data, loading: false})
        } catch(error) {
            set({ error: error.response.data.message, userDetail: null, loading: false })
        }
    }
    
}))

export default useUsersStore;