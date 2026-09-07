"use client";

import {
  Check,
  Share2,
} from "lucide-react";

import { useState } from "react";

interface ChallengeShareButtonProps {
  shiftedEnergyKwh: number;
  savingsAmount: number;
  streakDays: number;
  rank: number;
}

export function ChallengeShareButton({
  shiftedEnergyKwh,
  savingsAmount,
  streakDays,
  rank,
}: ChallengeShareButtonProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function handleShare() {
    const text = [
      "Dampak #ShiftMalam saya minggu ini:",

      `${shiftedEnergyKwh.toFixed(
        1,
      )} kWh dialihkan ke jam off-peak`,

      `Rp${Math.round(
        savingsAmount,
      ).toLocaleString(
        "id-ID",
      )} dihemat`,

      `${streakDays} hari streak`,

      rank > 0
        ? `Peringkat komunitas #${rank}`
        : null,

      "Cas malam, hemat nyata, grid aman — WattUp",
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.share) {
      await navigator.share({
        title:
          "Dampak #ShiftMalam WattUp",
        text,
      });

      return;
    }

    await navigator.clipboard.writeText(
      text,
    );

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      2_000,
    );
  }

  return (
    <button
      className={
        "challenge-share-button"
      }
      onClick={handleShare}
      type="button"
    >
      {copied ? (
        <Check
          aria-hidden
          size={17}
        />
      ) : (
        <Share2
          aria-hidden
          size={17}
        />
      )}

      {copied
        ? "Tersalin"
        : "Bagikan kartu dampak"}
    </button>
  );
}