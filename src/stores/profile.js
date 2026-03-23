import axiosApi from "@/utils/axios";
import { create } from "zustand";

const useProfilesStore = create((set, get) => ({
  profile: null,
  error: null,
  loading: false,

  GetProfile: async () => {
    set({ loading: true });
    try {
      const res = await axiosApi.get(`user/profile`);
      set({ profile: res.data.data.data, loading: false });
      return res.data.data;
    } catch (error) {
      // console.log(error);
      set({ error: error, loading: false });
    }
  },

  UpdateProfile: async (data) => {
    set({ loading: true });
    try {
      await axiosApi.patch("user/profile", data);
      get.GetProfile();
      set({ loading: false });
    } catch (error) {
      set({ error: error, loading: false });
    }
  },
}));

export default useProfilesStore;
