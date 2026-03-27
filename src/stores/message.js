import axiosApi from "@/utils/axios";
import { create } from "zustand";

const safeArray = (val) => (Array.isArray(val) ? val : []);

const useMessagesStore = create((set, get) => ({
  messages: [],
  messageDetails: [],
  error: null,
  loading: false,
  lastId: null,
  hasMore: null,

  GetMessages: async () => {
    set({ loading: true });
    try {
      const res = await axiosApi.get("user/messages");
      set({ messages: res.data.data, error: null, loading: false });
    } catch (error) {
      set({ messages: [], error: error.response.data.message, loading: false });
    }
  },

  GetMessage: async (otherUserUuid, lastId = null) => {
    set({ loading: true });
    try {
      const res = await axiosApi.get(`user/messages/${otherUserUuid}`, {
        params: { limit: 20, lastId },
      });
      const data = res?.data?.data || {};
      const messages = safeArray(data.messages);
      const hasMore = data.hasMore ?? false;
      set((state) => ({
        messageDetails: lastId
          ? [...messages, ...safeArray(state.messageDetails)]
          : messages,
        hasMore,
        loading: false,
        error: null,
      }));
    } catch (error) {
      set({
        messageDetails: [],
        error: error.response.data.message,
        loading: false,
      });
    }
  },

  resetMessages: () => set({ messageDetails: [], hasMore: true }),

  CreateMessage: async (data) => {
    set({ loading: true });
    try {
      await axiosApi.post("user/messages", data);
      get().GetMessages();
      set({ error: null, loading: false });
    } catch (error) {
      set({ error: error.response.data.message, loading: false });
    }
  },

  AddRealtimeMessage: (msg) => {
    set((state) => {
      const currentMessages = safeArray(state.messageDetails);
      // 🔥 prevent duplicate
      const isExist = currentMessages.some((m) => m.id === msg.id);
      if (isExist) return state;
      return {
        messageDetails: [...currentMessages, msg],
      };
    });
  },
}));

export default useMessagesStore;
