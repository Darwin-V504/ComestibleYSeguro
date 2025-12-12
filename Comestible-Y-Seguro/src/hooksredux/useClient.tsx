
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setClientProfile, updateClientProfile, updateProfileImage, clearClientProfile } from "../store/ClientSlice";

export const useClient = () => {
  const dispatch = useAppDispatch();
  const client = useAppSelector(state => state.client);

  const saveClientProfile = (clientData: any) => {
    const clientProfile = {
      id: Date.now().toString(),
      name: clientData.fullName,
      email: clientData.email,
      phone: clientData.phone,
      birthDate: clientData.birthDate,
      favoriteService: "Gestión de Despensa",
      notes: "Cliente de Comestible y Seguro",
      createdAt: new Date().toISOString(),
      profileImage: null 
    };
    
    dispatch(setClientProfile(clientProfile));
  };

  const updateProfile = (updates: any) => {
    dispatch(updateClientProfile(updates));
  };

  // actualizar imagen
  const updateProfilePicture = (imageUri: string) => {
    dispatch(updateProfileImage(imageUri));
  };

  const clearProfile = () => {
    dispatch(clearClientProfile());
  };

  return {
    client,
    saveClientProfile,
    updateProfile,
    updateProfilePicture, 
    clearProfile
  };
};