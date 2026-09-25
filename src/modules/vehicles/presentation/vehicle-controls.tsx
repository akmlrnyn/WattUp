"use client";

import {
  Archive,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Plus,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface VehicleItem {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  isPrimary: boolean;
}

interface VehicleControlsProps {
  vehicle?: VehicleItem;
}

type OpenDialog = "form" | "archive" | null;

export function VehicleControls({
  vehicle,
}: VehicleControlsProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const [openDialog, setOpenDialog] =
    useState<OpenDialog>(null);
  const [pendingAction, setPendingAction] =
    useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isPending = pendingAction !== null;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (openDialog && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [openDialog]);

  function closeDialog() {
    if (isPending) return;
    dialogRef.current?.close();
    setOpenDialog(null);
  }

  async function save(
    action: "add" | "edit" | "default" | "archive",
    form?: HTMLFormElement,
  ) {
    if (isPending) return;

    const data = form ? new FormData(form) : null;

    setPendingAction(action);
    setMessage(null);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          id: vehicle?.id,
          brand: data?.get("brand"),
          model: data?.get("model"),
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "Kendaraan gagal disimpan.",
        );
      }

      form?.reset();
      dialogRef.current?.close();
      setOpenDialog(null);
      setMessage({
        type: "success",
        text:
          action === "archive"
            ? "Kendaraan diarsipkan. Riwayat charging tetap tersimpan."
            : action === "default"
              ? "Kendaraan utama berhasil diperbarui."
              : vehicle
                ? "Perubahan kendaraan berhasil disimpan."
                : "Kendaraan baru berhasil ditambahkan.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Kendaraan gagal disimpan.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(vehicle ? "edit" : "add", event.currentTarget);
  }

  return (
    <div className="vehicle-controls">
      {vehicle ? (
        <div className="vehicle-actions">
          {!vehicle.isPrimary ? (
            <button
              className="vehicle-action-button"
              disabled={isPending}
              onClick={() => void save("default")}
              type="button"
            >
              {pendingAction === "default" ? (
                <LoaderCircle aria-hidden className="catat-spinner" size={16} />
              ) : (
                <Star aria-hidden size={16} />
              )}
              <span>Jadikan utama</span>
            </button>
          ) : null}

          <button
            className="vehicle-action-button"
            disabled={isPending}
            onClick={() => setOpenDialog("form")}
            type="button"
          >
            <Pencil aria-hidden size={16} />
            <span>Edit</span>
          </button>

          <button
            className="vehicle-action-button danger"
            disabled={isPending}
            onClick={() => setOpenDialog("archive")}
            type="button"
          >
            <Archive aria-hidden size={16} />
            <span>Arsipkan</span>
          </button>
        </div>
      ) : (
        <button
          className="vehicle-add-button"
          onClick={() => setOpenDialog("form")}
          type="button"
        >
          <Plus aria-hidden size={18} />
          Tambah kendaraan
        </button>
      )}

      {message ? (
        <p
          className={`vehicle-message ${message.type}`}
          role="status"
        >
          {message.type === "success" ? (
            <CheckCircle2 aria-hidden size={16} />
          ) : (
            <TriangleAlert aria-hidden size={16} />
          )}
          {message.text}
        </p>
      ) : null}

      {openDialog ? (
        <dialog
          aria-labelledby={`${formId}-title`}
          className="vehicle-dialog"
          onCancel={(event) => {
            if (isPending) event.preventDefault();
            else setOpenDialog(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
          ref={dialogRef}
        >
          <div className="vehicle-dialog-card">
            <div className="vehicle-dialog-heading">
              <div>
                <span className="vehicle-dialog-eyebrow">
                  {openDialog === "archive"
                    ? "Kelola kendaraan"
                    : vehicle
                      ? "Perbarui kendaraan"
                      : "Kendaraan baru"}
                </span>
                <h2 id={`${formId}-title`}>
                  {openDialog === "archive"
                    ? `Arsipkan ${vehicle?.name}?`
                    : vehicle
                      ? "Edit merek dan model"
                      : "Tambah kendaraan"}
                </h2>
              </div>

              <button
                aria-label="Tutup dialog"
                className="vehicle-dialog-close"
                disabled={isPending}
                onClick={closeDialog}
                type="button"
              >
                <X aria-hidden size={19} />
              </button>
            </div>

            {openDialog === "form" ? (
              <form className="vehicle-dialog-form" onSubmit={submit}>
                <p>
                  Cukup masukkan merek dan tipe kendaraan. WattUp akan membuat label yang unik secara otomatis.
                </p>

                <div className="vehicle-form-grid">
                  <label className="vehicle-field">
                    <span>Merek</span>
                    <input
                      autoFocus
                      defaultValue={vehicle?.brand ?? ""}
                      maxLength={60}
                      name="brand"
                      placeholder="Contoh: Hyundai"
                      required
                    />
                  </label>

                  <label className="vehicle-field">
                    <span>Tipe / model</span>
                    <input
                      defaultValue={vehicle?.model ?? ""}
                      maxLength={60}
                      name="model"
                      placeholder="Contoh: Ioniq 5"
                      required
                    />
                  </label>
                </div>

                <div className="vehicle-dialog-actions">
                  <button
                    className="vehicle-secondary-button"
                    disabled={isPending}
                    onClick={closeDialog}
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    className="vehicle-primary-button"
                    disabled={isPending}
                    type="submit"
                  >
                    {pendingAction === "add" || pendingAction === "edit" ? (
                      <LoaderCircle aria-hidden className="catat-spinner" size={17} />
                    ) : (
                      <CheckCircle2 aria-hidden size={17} />
                    )}
                    <span>
                      {pendingAction === "add" || pendingAction === "edit"
                        ? "Menyimpan..."
                        : vehicle
                          ? "Simpan perubahan"
                          : "Tambah kendaraan"}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="vehicle-archive-confirmation">
                <span className="vehicle-warning-icon">
                  <TriangleAlert aria-hidden size={22} />
                </span>
                <p>
                  Kendaraan tidak akan tersedia untuk sesi baru. Semua riwayat charging, energi, dan penghematan tetap tersimpan.
                </p>
                <div className="vehicle-dialog-actions">
                  <button
                    className="vehicle-secondary-button"
                    disabled={isPending}
                    onClick={closeDialog}
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    className="vehicle-danger-button"
                    disabled={isPending}
                    onClick={() => void save("archive")}
                    type="button"
                  >
                    {pendingAction === "archive" ? (
                      <LoaderCircle aria-hidden className="catat-spinner" size={17} />
                    ) : (
                      <Archive aria-hidden size={17} />
                    )}
                    <span>
                      {pendingAction === "archive"
                        ? "Mengarsipkan..."
                        : "Ya, arsipkan"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
