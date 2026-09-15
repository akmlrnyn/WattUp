"use client";

import {
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { authClient } from "@/modules/auth/presentation/auth-client";

import styles from "./sign-out-button.module.css";

interface SignOutButtonProps {
  compact?: boolean;
}

export function SignOutButton({
  compact = false,
}: SignOutButtonProps) {
  const router = useRouter();

  const cancelButtonRef =
    useRef<HTMLButtonElement>(null);

  const [isMounted, setIsMounted] =
    useState(false);

  const [isConfirmOpen, setIsConfirmOpen] =
    useState(false);

  const [isPending, setIsPending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    cancelButtonRef.current?.focus();

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isPending
      ) {
        setIsConfirmOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isConfirmOpen, isPending]);

  function openConfirmation() {
    setErrorMessage(null);
    setIsConfirmOpen(true);
  }

  function closeConfirmation() {
    if (isPending) {
      return;
    }

    setErrorMessage(null);
    setIsConfirmOpen(false);
  }

  async function handleSignOut() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const { error } =
        await authClient.signOut();

      if (error) {
        throw new Error(
          error.message ??
            "Logout gagal.",
        );
      }

      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      console.error(
        "SIGN_OUT_ERROR",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Logout gagal. Silakan coba lagi.",
      );

      setIsPending(false);
    }
  }

  const confirmationDialog =
    isMounted && isConfirmOpen
      ? createPortal(
          <div
            className={styles.backdrop}
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeConfirmation();
              }
            }}
          >
            <section
              aria-busy={isPending}
              aria-describedby="sign-out-description"
              aria-labelledby="sign-out-title"
              aria-modal="true"
              className={styles.dialog}
              role="alertdialog"
            >
              <span
                className={
                  styles.dialogIcon
                }
              >
                <LogOut
                  aria-hidden
                  size={21}
                  strokeWidth={2}
                />
              </span>

              <h2
                className={styles.title}
                id="sign-out-title"
              >
                Keluar dari WattUp?
              </h2>

              <p
                className={
                  styles.description
                }
                id="sign-out-description"
              >
                Kamu perlu masuk kembali
                untuk melihat aktivitas
                charging dan progres
                ShiftMalam.
              </p>

              {errorMessage ? (
                <p
                  className={
                    styles.error
                  }
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              <div
                className={
                  styles.actions
                }
              >
                <button
                  className={
                    styles.cancelButton
                  }
                  disabled={isPending}
                  onClick={
                    closeConfirmation
                  }
                  ref={cancelButtonRef}
                  type="button"
                >
                  Batal
                </button>

                <button
                  className={
                    styles.confirmButton
                  }
                  disabled={isPending}
                  onClick={handleSignOut}
                  type="button"
                >
                  {isPending ? (
                    <LoaderCircle
                      aria-hidden
                      className={
                        styles.spinner
                      }
                      size={17}
                    />
                  ) : (
                    <LogOut
                      aria-hidden
                      size={16}
                    />
                  )}

                  {isPending
                    ? "Keluar..."
                    : "Ya, keluar"}
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        aria-label="Keluar dari WattUp"
        className={
          `sign-out-button ${
            compact ? "compact" : ""
          }`.trim()
        }
        disabled={isPending}
        onClick={openConfirmation}
        type="button"
      >
        <LogOut
          aria-hidden
          size={compact ? 18 : 19}
        />

        <span>Keluar</span>
      </button>

      {confirmationDialog}
    </>
  );
}