import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  language: string;
}

const initialState: UIState = {
  theme: 'dark',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  notifications: true,
  soundEnabled: true,
  language: 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleNotifications,
  toggleSound,
  setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
