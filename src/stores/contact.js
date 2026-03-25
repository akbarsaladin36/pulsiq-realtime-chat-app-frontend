import axiosApi from "@/utils/axios";
import { create } from "zustand";

const useContactsStore = create((set, get) => ({
    contacts: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
    },
    loading: false,
    search: "",
    error: null,

    setSearchContact: (value) => set({ search: value }),

    GetContacts: async (isLoadMore = false) => {
        const { pagination, search, contacts } = get();
        set({ loading: true });
        try {
            const res = await axiosApi.get("user/contacts", {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search,
                },
            });
            const result = res.data.data;
            set({
                contacts: isLoadMore ? [...contacts, ...result.data] : result.data,
                pagination: result.pagination,
                error: null,
                loading: false
            });
        } catch(error) {
            set({ error: error.response.data.message, loading: false })
        }
    },

    nextPageContact: async () => {
        const { pagination } = get();

        if (pagination.page >= pagination.total_pages) return;

        set((state) => ({
            pagination: {
                ...state.pagination,
                page: state.pagination.page + 1,
            },
        }));
        await get().GetContacts(true);
    },

    resetAndFetchContact: async () => {
        set({
            contacts: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                total_pages: 0,
            },
        });
        await get().GetContacts(false);
    },

    CreateContact: async (data) => {
        set({ loading: true })
        try {
            await axiosApi.post('user/contacts', data)
            set({ error: null, loading: false })
            await get().GetContacts(false)
        } catch(error) {
            set({ error: error.response.data.message, loading: false })
        }
    },

    DeleteContact: async (contactUuid) => {
        set({ loading: true })
        try {
            await axiosApi.delete(`user/contacts/${contactUuid}`)
            set({ error: null, loading: false })
            await get().GetContacts(false)
        } catch(error) {
            set({ error: error.response.data.message, loading: false })
        }
    }
}));

export default useContactsStore;