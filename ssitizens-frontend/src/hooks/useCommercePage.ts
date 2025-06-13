/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUsers, usePostUsers, useDeleteUserByID } from "@/services/index";
import {  EType,  IUser } from "@/services/useCitizensAndCommerce/useCitizensAndCommerce.types";
import { forceRedemption } from "@/services/useAdminFunctions/useAdminFunctions"
import { useTranslation } from "react-i18next"

export interface CommerceData {
  responsibleName: string;
  commerceName: string;
  cif: string;
  phone: string;
  email: string;
}

export function useCommercePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showAddCommerceModal, setShowAddCommerceModal] = useState(false);
  const [showCommerceConfirmationModal, setShowCommerceConfirmationModal] =
    useState(false);
  const [commerceName, setCommerceName] = useState("");
  const [selectedCommerce, setSelectedCommerce] = useState<IUser | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const {t} = useTranslation();
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBlockConfirmationModal, setShowBlockConfirmationModal] =
    useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useGetUsers({
    type: EType.store,
    email: searchQuery,
    address: "",
    page,
    page_size: pageSize,
  });

  const { mutate: createCommerce } = usePostUsers();
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

  function handleAddCommerce() {
    setShowAddCommerceModal(true);
  }

  function handleCloseAddCommerceModal(data?: CommerceData) {
    setShowAddCommerceModal(false);

    if (data) {
      setCommerceName(data.commerceName);
      setShowCommerceConfirmationModal(true);

      createCommerce(
        {
          email: data.email,
          type: EType.store,
          data: {
            full_name: data.responsibleName,
            store_id: data.commerceName,
            cif: data.cif,
            phone_number: data.phone,
          },
        },
        {
          onSuccess: (newStore) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            openMessageModal(
              t("toastCommerce.createdTitle"),
              t("toastCommerce.createdDescription", { email: newStore.email }),
            );
            toast({
              title: t("toastCommerce.createdTitle"),
              description: t("toastCommerce.createdDescription", { email: newStore.email }),
              variant: "success",
            });
          },
          onError: (error: any) => {
            const errorData = error.response?.data;
            const errorMessage = t("toastCommerce.errorDescription")
            // if (errorData) {
            //   errorMessage = transformCommerceErrorMessage(errorData);
            // }
            openMessageModal("Error al crear comercio", errorMessage);
            toast({
              title: t("toastCommerce.errorTitle"),
              description: t("toastCommerce.errorDescription"),
              variant: "destructive",
            });
          },
        }
      );
    }
  }

  function handleProcessPayment(commerce: IUser) {
    toast({
      title: "Realizar pago",
      description: `Procesando pago para ${
        commerce.data?.full_name ?? "(sin nombre)"
      }`,
    });
  }

  function handleViewHistory(commerce: IUser) {
    navigate(
      `/transaction-history?commerceId=${commerce.id}&commerceName=${commerce.data?.full_name}`
    );
  }

  function handleBlockCommerce(commerce: IUser) {

    setSelectedCommerce(commerce);
    setShowBlockModal(true);
  }

  
    function handleConfirmBlock() {
      if (!selectedCommerce) return;
      forceRedemption(selectedCommerce.id)
        .then(() => {
          setShowBlockModal(false);
          setShowBlockConfirmationModal(true);
            toast({
              title: t("toastCommerce.blockedTitle"),
              description: t("toastCommerce.blockedDescription"),
          });
        })
        .catch(() => {
          toast({
            title: t("toastCitizen.errorBlockTitle"),
            description: t("toastCitizen.errorBlockDescription"),
            variant: "destructive",
          });
          setShowBlockModal(false);
          setSelectedCommerce(null);
        });
    }
  
    function handleCloseBlockConfirmation() {
      setShowBlockConfirmationModal(false);
      setSelectedCommerce(null);
      toast({
        title: t("toastCommerce.blockedTitle"),
        description: t("toastCommerce.blockedDescription"),
      });
    }

  function handleDeleteCommerce(commerce: IUser) {
    deleteUser(
      { id: commerce.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast({
            title: t("toastCommerce.deletedTitle"),
            description: t("toastCommerce.deletedDescription", { name: commerce.data?.store_name }),
          });
        },
        onError: () => {
          toast({
            title: t("toastCommerce.errorDeleteTitle"),
            description: t("toastCommerce.errorDeleteDescription"),
            variant: "destructive",
          });
        },
      }
    );
  }

  function handleCancelBlock() {
  setShowBlockModal(false);
  setSelectedCommerce(null);
  }

  function handlePrevPage() {
    setPage((prev) => Math.max(prev - 1, 1));
  }

  function handleNextPage() {
    setPage((prev) => prev + 1);
  }

  function handleChangePageSize(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  const commerceList = data?.results ?? [];

  return {
    searchQuery,
    setSearchQuery,
    page,
    pageSize,
    showAddCommerceModal,
    showCommerceConfirmationModal,
    commerceName,
    selectedCommerce,
    isLoading,
    error,
    commerceList,
    showMessageModal,
    modalTitle,
    modalMessage,
    closeMessageModal,
    handleAddCommerce,
    handleCloseAddCommerceModal,
    handleProcessPayment,
    handleViewHistory,
    handleBlockCommerce,
    handleDeleteCommerce,
    handlePrevPage,
    handleNextPage,
    handleChangePageSize,
    showBlockModal,
    showBlockConfirmationModal,
    handleConfirmBlock,
    handleCloseBlockConfirmation,
    handleCancelBlock
  };
}
