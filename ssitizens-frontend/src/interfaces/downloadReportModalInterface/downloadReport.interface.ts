export interface IDownloadReportModalProps {
  citizenId: string;
  citizenName: string;
  onCancel: () => void;
  onConfirm: (range: { from: Date; to: Date }, citizenId: string) => void;
  isLoading: boolean;
}
