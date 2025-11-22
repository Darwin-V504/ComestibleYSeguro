import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ClientProfile {
    name: string;
    phone: string;
    favoriteService: string;
    notes: string;
}

const initialState: ClientProfile = {
    name: "",
    phone: "",
    favoriteService: "",
    notes: ""
};

const clientSlice = createSlice({
    name: "client",
    initialState,
    reducers: {
        setClientProfile: (state, action: PayloadAction <ClientProfile>) =>{
            state.name= action.payload.name;
            state.phone= action.payload.phone;
            state.favoriteService= action.payload.favoriteService;
            state.notes= action.payload.notes;
            
        },
        clearClientProfile: () => initialState,

    }
});
export const {setClientProfile, clearClientProfile} = clientSlice.actions; 
export default clientSlice.reducer;