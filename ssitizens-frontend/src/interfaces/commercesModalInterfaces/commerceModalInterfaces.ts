export interface ICommerceData {
  responsibleName: string;
  commerceName: string;
  cif: string;
  phone: string;
  email: string;
}

export interface CommerceModalProps {
  onClose: (data?: ICommerceData) => void;
}