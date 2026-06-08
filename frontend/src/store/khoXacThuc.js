// Chức năng: Store Zustand lưu phiên đăng nhập và user.
// Kho trang thai dang nhap: luu user/token va phuc hoi phien bang localStorage.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const useKhoXacThuc = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthReady: false,
      showLoginOffer: false,
      favoriteRooms: [],
      setSession: ({ token, user }) =>
        set({
          token,
          user,
          isAuthReady: true,
        }),
      setUser: (user) =>
        set({
          user,
        }),
      setShowLoginOffer: (show) => set({ showLoginOffer: show }),
      setFavoriteRooms: (roomIds) => set({ favoriteRooms: roomIds }),
      addFavoriteRoom: (roomId) =>
        set((state) => ({ favoriteRooms: [...state.favoriteRooms, roomId] })),
      removeFavoriteRoom: (roomId) =>
        set((state) => ({
          favoriteRooms: state.favoriteRooms.filter((id) => id !== roomId),
        })),
      clearSession: () =>
        set({
          token: null,
          user: null,
          isAuthReady: true,
          favoriteRooms: [],
        }),
      markReady: () =>
        set({
          isAuthReady: true,
        }),
      markPending: () =>
        set({
          isAuthReady: false,
        }),
    }),
    {
      name: 'staynest-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useKhoXacThuc;
