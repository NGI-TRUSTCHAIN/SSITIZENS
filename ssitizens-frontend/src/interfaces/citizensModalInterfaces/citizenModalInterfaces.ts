export interface ICitizenData {
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  funds: number;
  aid: string | number ;
}

export interface CitizenModalProps {
  onClose: (data?: ICitizenData) => void;
}