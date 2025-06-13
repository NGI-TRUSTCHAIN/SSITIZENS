/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUsers, usePostUsers, useDeleteUserByID } from "@/services/index";
import {
  EType,
  IUser,
} from "../services/useCitizensAndCommerce/useCitizensAndCommerce.types";
import { useToast } from "@/hooks/useToast";
import { transformCitizensErrorMessage } from "@/utils/errorMessageCreateCitizens";
import { ICitizenData } from "@/interfaces";
import { useDownloadReport } from "@/services/useExportPdf/useExportPdf";
import { useTranslation } from "react-i18next"
import { rechargeTokens } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce"
import { forceRedemption } from "@/services/useAdminFunctions/useAdminFunctions"

export function useCitizensPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showAddCitizenModal, setShowAddCitizenModal] = useState(false);
  const [citizenName, setCitizenName] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState<IUser | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showRechargeConfirmationModal, setShowRechargeConfirmationModal] =
    useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBlockConfirmationModal, setShowBlockConfirmationModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showDownloadReportModal, setShowDownloadReportModal] = useState(false);
  const [reportDateRange, setReportDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const {
    mutate: downloadReport,
    isPending: isDownloadingReport,
  } = useDownloadReport();
  const {t} = useTranslation();


  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useGetUsers({
    type: EType.beneficiary,
    email: searchQuery,
    address: "",
    page,
    page_size: pageSize,
  });

  const { mutate: createCitizen } = usePostUsers();
  const { mutate: deleteUser } = useDeleteUserByID();

  function openMessageModal(title: string, message: string) {
    setModalTitle(title);
    setModalMessage(message);
    setShowMessageModal(true);
  }

  function closeMessageModal() {
    setShowMessageModal(false);
    setModalTitle("");
    setModalMessage("");
  }

  function handleAddCitizen() {
    setShowAddCitizenModal(true);
  }

  function handleCloseAddCitizenModal(data?: ICitizenData) {
    setShowAddCitizenModal(false);

    if (data) {
      setCitizenName(data.fullName);

      createCitizen(
        {
          email: data.email,
          type: EType.beneficiary,
          aid_type: data.aid,
          data: {
            dni: data.dni,
            full_name: data.fullName,
            phone_number: data.phone,
            aid_funds: data.funds,
          },
        },
        {
          onSuccess: (newCitizen) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            openMessageModal(
              t("toastCitizen.createdTitle"),
              t("toastCitizen.createdModal", { fullName: data.fullName })
            );
            toast({
              title: t("toastCitizen.createdTitle"),
              description: t("toastCitizen.createdDescription", { email: newCitizen.email }),
            });
          },
          onError: (error: any) => {
            const errorData = error.response?.data;
            const errorMessage =  t("toastCitizen.errorGeneral")

            // if (errorData) {
            //   errorMessage = transformCitizensErrorMessage(errorData, t);
            // }
            openMessageModal("Error", errorMessage);
            toast({
              title: t("toastCitizen.errorTitle"),
              description: t("toastCitizen.errorDescription"),
              variant: "destructive",
            });
          },
        }
      );
    }
  }

  function handleRechargeBalance(citizen: IUser) {
    setSelectedCitizen(citizen);
    setShowRechargeModal(true);
  }

  function handleCloseRechargeModal() {
    setShowRechargeModal(false);
    setSelectedCitizen(null);
  }

  async function handleRechargeSubmit(amount: number) {
      setRechargeAmount(amount);
      setShowRechargeModal(false);

      try {
        await rechargeTokens(selectedCitizen.id, amount, "");
        setShowRechargeConfirmationModal(true);
      } catch (error) {
        toast({
          title: t("common.error", "Error"),
          description: String(error),
          variant: "destructive",
        });
      }
    }

  function handleCloseRechargeConfirmation() {
    setShowRechargeConfirmationModal(false);
    setSelectedCitizen(null);
  }

  function handleDownloadReport(citizen: IUser) {
    setSelectedCitizen(citizen);
    setShowDownloadReportModal(true);
  }

  function handleConfirmDownloadReport(
    range: { from: Date; to: Date },
    citizenId: string
  ) {
  // Formato: YYYY-MM-DD HH:MM:SS+00:00
  const formatDate = (date: Date) => {
    const iso = date.toISOString();
    const [datePart, timePart] = iso.split("T");
    const [hms, msAndZone] = timePart.split(".");
    return `${datePart} ${hms}+00:00`;
  };

  const since = formatDate(range.from);
  const until = formatDate(range.to);

    downloadReport(
      { user: citizenId, since, until },
      {
        onSuccess: () => {
          toast({
            title: t("toastReport.requestedTitle"),
            description: t("toastReport.requestedDescription"),
            variant: "success",
          });
          setShowDownloadReportModal(false);
          setReportDateRange(null);
        },
        onError: (error) => {
          toast({
            title: t("toastReport.errorTitle"),
            description: t("toastReport.errorDescription"),
            variant: "destructive",
          });
        },
      }
    );
  }

  function handleViewHistory(citizen: IUser) {
    const fullName = citizen.data?.full_name || "";
    navigate(
      `/transaction-history?citizenId=${
        citizen.id
      }&citizenName=${encodeURIComponent(fullName)}`
    );
  }

  function handleBlockCitizen(citizen: IUser) {
    setSelectedCitizen(citizen);
    setShowBlockModal(true);
  }

  function handleConfirmBlock() {
    if (!selectedCitizen) return;
    forceRedemption(selectedCitizen.id)
      .then(() => {
        setShowBlockModal(false);
        setShowBlockConfirmationModal(true);
        toast({
          title: t("toastCitizen.blockedTitle"),
          description: t("toastCitizen.blockedDescription"),
        });
      })
      .catch(() => {
        toast({
          title: t("toastCitizen.errorBlockTitle"),
          description: t("toastCitizen.errorBlockDescription"),
          variant: "destructive",
        });
        setShowBlockModal(false);
        setSelectedCitizen(null);
      });
  }

  function handleCloseBlockConfirmation() {
    setShowBlockConfirmationModal(false);
    setSelectedCitizen(null);
    toast({
      title: t("toastCitizen.blockedTitle"),
      description: t("toastCitizen.blockedDescription"),
    });
  }

  function handleCancelBlock() {
    setShowBlockModal(false);
    setSelectedCitizen(null);
  }

  function handleDeleteCitizen(citizen: IUser) {
    setSelectedCitizen(citizen);
    setShowDeleteModal(true);
  }

  function handleConfirmDelete() {
    if (!selectedCitizen) return;

    deleteUser(
      { id: selectedCitizen.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast({
            title: t("toastCitizen.deletedTitle"),
            description: t("toastCitizen.deletedDescription"),
          });
        },
        onError: () => {
          toast({
            title: t("toastCitizen.errorDeleteTitle"),
            description: t("toastCitizen.errorDeleteDescription"),
            variant: "destructive",
          });
        },
      }
    );

    setShowDeleteModal(false);
    setShowDeleteConfirmationModal(true);
  }
  function handleCancelDownloadReport() {
    setShowDownloadReportModal(false);
    setSelectedCitizen(null);
    setReportDateRange(null);
  }

  function handleCloseDeleteConfirmation() {
    setShowDeleteConfirmationModal(false);
    setSelectedCitizen(null);
  }

  function handleCancelDelete() {
    setShowDeleteModal(false);
    setSelectedCitizen(null);
  }

  // Paginación
  function handlePrevPage() {
    setPage((prev) => Math.max(prev - 1, 1));
  }

  function handleNextPage() {
    setPage((prev) => prev + 1);
  }

  function handleChangePageSize(e: React.ChangeEvent<HTMLSelectElement>) {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(1);
  }

  return {
    searchQuery,
    setSearchQuery,
    page,
    pageSize,
    handlePrevPage,
    handleNextPage,
    handleChangePageSize,
    showAddCitizenModal,
    handleAddCitizen,
    handleCloseAddCitizenModal,
    citizenName,
    selectedCitizen,
    showRechargeModal,
    showRechargeConfirmationModal,
    rechargeAmount,
    showBlockModal,
    showBlockConfirmationModal,
    showDeleteModal,
    showDeleteConfirmationModal,
    handleRechargeBalance,
    handleCloseRechargeModal,
    handleRechargeSubmit,
    handleCloseRechargeConfirmation,
    handleViewHistory,
    handleBlockCitizen,
    handleConfirmBlock,
    handleCloseBlockConfirmation,
    handleCancelBlock,
    handleDeleteCitizen,
    handleConfirmDelete,
    handleCloseDeleteConfirmation,
    handleCancelDelete,
    handleDownloadReport,
    showDownloadReportModal,
    handleCancelDownloadReport,
    handleConfirmDownloadReport,
    showMessageModal,
    modalTitle,
    modalMessage,
    closeMessageModal,
    data,
    isLoading,
    error,
    isDownloadingReport
  };
}
