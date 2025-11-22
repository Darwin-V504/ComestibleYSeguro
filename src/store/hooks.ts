import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Hook para dispatch con tipos
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook para selector con tipos
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;