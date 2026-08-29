"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { errorMessage } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { ImageWithGallery } from "@/components/ui/image-with-gallery";
import { RoundCountdown } from "@/components/ui/round-countdown";
import { RoundStatusBadge } from "@/components/ui/round-status-badge";
import { SpecChip } from "@/components/ui/spec-chip";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { useGetAuctionQuery, useGetRoundStateQuery } from "@/services/auctions-api";
import { usePlaceOfferMutation } from "@/services/offers-api";
import { useAppSelector } from "@/redux/hooks";
import { useCountdown } from "@/lib/use-countdown";
import { getServerNow } from "@/lib/server-time";

const fmtShort = (t?: string) =>
  t ? new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export function UserLiveRoomClient({ id }: { id: string }) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerSuccess, setOfferSuccess] = useState("");

  const { data: auctionData } = useGetAuctionQuery(id, { pollingInterval: 5000 });
  const { data: roundState } = useGetRoundStateQuery(id, { pollingInterval: 5000 });
  const [placeOffer, { isLoading: offerLoading }] = usePlaceOfferMutation();
  const currentRoundFromAuction = auctionData?.auction?.currentRound || 1;
  const roundStartCountdown = useCountdown(auctionData?.auction?.roundTimes?.[currentRoundFromAuction - 1]?.start);

  const auction = auctionData?.auction;
  const userId = user?._id || user?.id;
  const isParkingSale = !!auction?.isParkingSale;
  const hasAccess =
    isParkingSale ||
    !!user?.paidAccessAuctions?.some(
      (a) => a === id || (auction && a === auction._id)
    );

  const placeOfferHandler = async () => {
    setOfferError("");
    setOfferSuccess("");
    const val = Number(offerAmount);
    if (!offerAmount || isNaN(val) || val <= 0) {
      setOfferError("Enter a valid offer amount");
      return;
    }
    if (!Number.isInteger(val)) {
      setOfferError("Offer amount must be a whole number (no decimals)");
      return;
    }
    const minStarting = auction?.startingOffer ?? 0;
    if (minStarting && val < minStarting) {
      setOfferError(
        isParkingSale
          ? `Quote must be at least the starting price of ₹${minStarting.toLocaleString("en-IN")}`
          : `Offer must be at least the starting price of ₹${minStarting.toLocaleString("en-IN")}`
      );
      return;
    }
    try {
      await placeOffer({
        auctionId: id,
        amount: val,
        round: roundState?.currentRound,
      }).unwrap();
      setOfferSuccess("Offer placed successfully!");
      setOfferAmount("");
    } catch (err) {
      setOfferError(errorMessage(err, "Offer failed"));
    }
  };

  if (!auction) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col md:flex-row">
          <div className="md:w-96 shrink-0 relative h-56 md:h-64">
            <Skeleton className="absolute inset-0 rounded-none" />
          </div>
          <div className="flex-1 p-5 space-y-4">
            <div className="space-y-2.5">
              <SkeletonText className="w-3/4 h-5" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 p-4 bg-surface-container-low rounded-xl">
              <div className="space-y-2">
                <SkeletonText className="w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                <SkeletonText className="w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-1 min-w-[170px] p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-3">
                  <Skeleton className="h-5 w-20 rounded-full mx-auto" />
                  <SkeletonText className="w-16 mx-auto" />
                  <div className="space-y-1.5">
                    <SkeletonText className="w-full" />
                    <SkeletonText className="w-2/3 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRound = roundState?.currentRound || auction.currentRound || 1;
  const roundStates = roundState?.roundStates || auction.roundStates || [];
  const currentRoundState = roundStates[currentRound - 1];
  const totalRounds = roundState?.totalRounds || auction.rounds || roundStates.length || 1;
  const userHasOffer = Boolean(roundState?.userHasOfferThisRound);
  const isEnded = auction.status === "ENDED" || (
    !isParkingSale &&
    Boolean(auction.roundTimes?.length) &&
    new Date(auction.roundTimes?.[auction.roundTimes.length - 1]?.end || auction.endTime || 0).getTime() <= getServerNow()
  );
  const isLive = !isEnded && auction.status === "LIVE";
  const isRoundActive = !isEnded && roundStates[currentRound - 1]?.status === "active";
  const winnerId = typeof auction.winner === "string" ? auction.winner : auction.winner?._id;
  const isWinner = isEnded && !!userId && !!winnerId && winnerId.toString() === userId.toString();

  return (
    <div className="space-y-6">
      {offerError && (
        <Alert variant="error" onDismiss={() => setOfferError("")}>
          {offerError}
        </Alert>
      )}
      {offerSuccess && (
        <Alert variant="success" onDismiss={() => setOfferSuccess("")}>
          {offerSuccess}
        </Alert>
      )}

      <div className="bg-white rounded-2xl overflow-hidden shadow-xs group flex flex-col md:flex-row">
        <div className="md:w-96 shrink-0 flex flex-col">
          <div className="relative h-56 md:h-64 overflow-hidden bg-black/5">
            <div className="absolute top-2.5 left-2.5 z-10">
              <Badge variant={isLive ? "live" : "secondary"} pulse={isLive}>
                {isEnded ? "ENDED" : isLive ? "LIVE" : auction.status}
              </Badge>
            </div>
            <ImageWithGallery
              src={auction.image || ""}
              alt={auction.title}
              images={auction.images}
              imgClassName="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="px-4 py-2 border-t border-outline-variant/20">
            <h1 className="text-xl font-extrabold text-on-surface leading-snug flex items-center justify-between gap-2">
              <span>{auction.title}</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg shadow-sm font-semibold">
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Lot ID :</span>
                <span className="font-mono text-xl font-extrabold">{auction.lotNumber}</span>
              </span>
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px] text-on-surface-variant font-medium">
              {typeof auction.mileage === "number" && (
                <SpecChip icon="speed">{auction.mileage.toLocaleString("en-IN")} km</SpecChip>
              )}
              {auction.fuelType && <SpecChip icon="local_gas_station">{auction.fuelType}</SpecChip>}
              {auction.transmission && <SpecChip icon="settings">{auction.transmission}</SpecChip>}
              {auction.location && <SpecChip icon="location_on">{auction.location}</SpecChip>}
            </div>
            {auction.description && (
              <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{auction.description}</p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-3 p-4 bg-surface-container-low rounded-xl">
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">
                  {isParkingSale ? "Starting Quote" : "Starting Offer"}
                </p>
                <p className="text-base font-extrabold text-primary">{formatINR(auction.startingOffer)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Reg. Fee</p>
                <p className="text-base font-bold text-on-surface">
                  {isParkingSale ? "Free" : formatINR(auction.registrationFee || 0)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-x-6 gap-y-4 mt-4">
              {isParkingSale ? (
                <div className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Sale Started</p>
                    <p className="text-sm font-extrabold text-primary">{fmtShort(auction.roundTimes?.[0]?.start)}</p>
                  </div>
                </div>
              ) : (
              roundStates.map((rs: any, i: number) => {
                const rt = auction.roundTimes?.[rs.round - 1];
                const fmt = (t?: string) => t ? new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[170px] p-4 rounded-xl border text-center flex flex-col items-center justify-between gap-2 ${
                      i + 1 === currentRound
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-outline-variant/20 bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <RoundStatusBadge status={rs.status} />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-on-surface">Round {rs.round}</p>
                      {rs.status === "completed" && rs.highestOffer ? (
                        <div>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Highest Offer</p>
                          <p className="text-base font-extrabold font-mono text-primary">
                            {formatINR(rs.highestOffer)}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full space-y-1 pt-2 mt-1 border-t border-outline-variant/20 text-[10px] font-medium text-on-surface-variant">
                      <p>Start: {fmt(rt?.start)}</p>
                      <p>End: {fmt(rt?.end)}</p>
                    </div>

                    {i + 1 === currentRound && (
                      <div className="w-full pt-1.5 border-t border-outline-variant/20">
                        <RoundCountdown roundTimes={auction.roundTimes} currentRound={auction.currentRound} status={auction.status} className="text-[10px] justify-center" />
                      </div>
                    )}
                  </div>
                );
              })
              )}
            </div>

            {isLive && hasAccess && (isParkingSale ? true : isRoundActive) && (
              <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
                {isParkingSale ? (
                  <>
                    {userHasOffer && (
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-xs font-bold text-on-surface">Your Latest Quote</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            {roundState?.userLastOffer?.createdAt
                              ? `Placed ${new Date(roundState.userLastOffer.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : "Your most recent quote"}
                          </p>
                        </div>
                        <p className="text-lg font-extrabold font-mono text-primary">
                          {formatINR(roundState?.userLastOffer?.amount || 0)}
                        </p>
                      </div>
                    )}
                    <p className="text-xs font-bold text-on-surface">{userHasOffer ? "Place Another Quote" : "Place Your Quote"}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                      <div className="flex gap-2 flex-1">
                        <input
                          type="number"
                          step={1}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="Enter quote amount"
                          className="flex-1 h-10 rounded-xl px-3 text-xs font-medium focus:outline-none focus:border-primary border border-outline-variant/40"
                        />
                        <button
                          onClick={placeOfferHandler}
                          disabled={offerLoading}
                          className="px-6 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl disabled:opacity-50"
                        >
                          {offerLoading ? "Placing..." : "Place Quote"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : userHasOffer ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-on-surface">Offer Placed — Round {currentRound}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Your offer for this round</p>
                    </div>
                    <p className="text-lg font-extrabold font-mono text-primary">
                      {formatINR(roundState?.userLastOffer?.amount || 0)}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-on-surface">Place Offer — Round {currentRound}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                      <div className="flex gap-2 flex-1">
                        <input
                          type="number"
                          step={1}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="Enter offer amount"
                          className="flex-1 h-10 rounded-xl px-3 text-xs font-medium focus:outline-none focus:border-primary border border-outline-variant/40"
                        />
                        <button
                          onClick={placeOfferHandler}
                          disabled={offerLoading}
                          className="px-6 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl disabled:opacity-50"
                        >
                          {offerLoading ? "Placing..." : "Place Offer"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {isLive && hasAccess && currentRoundState?.status === "paused" && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 text-xl">pause_circle</span>
                <div>
                  <p className="text-xs font-bold text-amber-900">Round {currentRound} is paused</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Offers are not being accepted until the admin resumes the round.</p>
                </div>
              </div>
            )}

            {isLive && hasAccess && currentRoundState?.status === "pending" && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                <div>
                  <p className="text-xs font-bold text-primary">Round {currentRound} hasn&apos;t started yet</p>
                  <p className="text-sm font-extrabold font-mono text-primary mt-0.5">
                    {roundStartCountdown.hasStarted ? "Starting soon..." : `Starts in ${roundStartCountdown.display || "..."}`}
                  </p>
                </div>
              </div>
            )}

            {isLive && !hasAccess && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-amber-900">Access Required</p>
                  <p className="text-xs text-amber-700">Pay {formatINR(auction.registrationFee || auction.offerUnlockFee || 0)} to unlock offering for this auction</p>
                </div>
                <button
                  onClick={() => router.push(`/register/payment?redirect=/user/live/${id}`)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
                >
                  Pay & Get Access
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(auction.description || auction.rules) && (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-outline-variant/20">
          <h3 className="text-xs font-bold uppercase tracking-wider">Description & Rules</h3>
          {auction.description && (
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Description</p>
              <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">{auction.description}</p>
            </div>
          )}
          {auction.rules && (
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Rules</p>
              <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">{auction.rules}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {isEnded && isWinner && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-emerald-600">emoji_events</span>
              <h3 className="text-sm font-extrabold text-emerald-900">Congratulations! You Won!</h3>
            </div>
            <p className="text-lg font-extrabold text-emerald-700">Winning Offer: {formatINR(auction.winningOffer || 0)}</p>
            <p className="text-xs text-emerald-800">You will be notified and the auctioneer will connect with you.</p>
          </div>
        )}

        {isEnded && !isWinner && (
          <div className="bg-surface-container-low rounded-2xl p-5 text-center space-y-1">
            <p className="text-sm font-bold text-on-surface-variant">
              {isParkingSale ? "The parking sale has ended — you did not win" : `Round ${totalRounds} completed — You lost the auction`}
            </p>
            <p className="text-xs text-outline mt-1">Try another upcoming offer. Thanks for participating!</p>
          </div>
        )}

        <Link href="/user/dashboard">
          <button className="w-full py-2.5 border border-outline-variant text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container transition-all">
            Return to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
