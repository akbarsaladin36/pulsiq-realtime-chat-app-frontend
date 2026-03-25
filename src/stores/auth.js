import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cookieStorage } from "../utils/cookieStorage";
import axiosApi from "../utils/axios";
import { removeToken, setToken } from "@/utils/auth";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      error: null,
      loading: false,
      register: async (data) => {
        set({ loading: true });
        try {
          const res = await axiosApi.post("auth/register", data);
          set({ user: res.data.data, loading: false });
        } catch (error) {
          set({ user: null, error: error.response.data.message });
        }
      },
      login: async (data) => {
        set({ loading: true });
        try {
          const res = await axiosApi.post("auth/login", data);
          setToken(res.data.data.token);
          set({ user: res.data.data, loading: false });
          return res.data.data;
        } catch (error) {
          console.log(error);
          set({
            user: null,
            error: error.response.data.message,
            loading: false,
          });
        }
      },
      logout: async () => {
        set({ loading: true });
        try {
          removeToken();
          set({ user: null, loading: false });
        } catch (error) {
          set({ user: null, error: error.response.data.message });
        }
      },
      fetchUser: async () => {
        try {
          const res = await axiosApi.get("auth/me");
          set({ user: res.data.data, loading: false });
        } catch (error) {
          set({ user: null, error: error.response.data.message });
        }
      },
    }),
    {
      name: "token-storage",
      storage: cookieStorage,
    },
  ),
);

export default useAuthStore;
