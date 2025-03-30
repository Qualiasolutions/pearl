import { create } from 'zustand';
import { Shade, predefinedShades } from '../data/shades';

interface AppState {
  allShades: Shade[];
  selectedShade: Shade | null;
  isCameraReady: boolean;
  isFaceDetected: boolean;
  setSelectedShade: (shade: Shade | null) => void;
  addCustomShade: (shade: Shade) => void;
  setCameraReady: (isReady: boolean) => void;
  setFaceDetected: (isDetected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  allShades: predefinedShades,
  selectedShade: null,
  isCameraReady: false,
  isFaceDetected: false,

  setSelectedShade: (shade) => set({ selectedShade: shade }),

  addCustomShade: (shade) => set((state) => ({ allShades: [...state.allShades, shade] })),

  setCameraReady: (isReady) => set({ isCameraReady: isReady }),

  setFaceDetected: (isDetected) => set({ isFaceDetected: isDetected }),
})); 