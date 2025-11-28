
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ClientProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    favoriteService: string;
    notes: string;
    createdAt: string;
    profileImage: string | null; 
}

const initialState: ClientProfile = {
    id: "",
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    favoriteService: "",
    notes: "",
    createdAt: "",
    profileImage: null 
};

const clientSlice = createSlice({
    name: "client",
    initialState,
    reducers: {
        setClientProfile: (state, action: PayloadAction<ClientProfile>) => {
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.phone = action.payload.phone;
            state.birthDate = action.payload.birthDate;
            state.favoriteService = action.payload.favoriteService;
            state.notes = action.payload.notes;
            state.createdAt = action.payload.createdAt;
            state.profileImage = action.payload.profileImage; // 👈 NUEVO
        },
        updateClientProfile: (state, action: PayloadAction<Partial<ClientProfile>>) => {
            return { ...state, ...action.payload };
        },
     
        updateProfileImage: (state, action: PayloadAction<string>) => {
            state.profileImage = action.payload;
        },
        clearClientProfile: () => initialState,
    }
});

export const { setClientProfile, updateClientProfile, updateProfileImage, clearClientProfile } = clientSlice.actions;
export default clientSlice.reducer;