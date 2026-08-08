"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { offersApi } from "@/services/offers-api";
import type { Offer } from "@/types";

type WsMessage = {
  type?: string;
  auction?: string;
  offer?: Offer;
};

function resolveWsUrl(auctionId: string): string {
  const override = process.env.NEXT_PUBLIC_AUCTION_WS_URL;
  const port = process.env.NEXT_PUBLIC_AUCTION_WS_PORT || "3001";
  if (override) return `${override}?auction=${encodeURIComponent(auctionId)}`;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:${port}?auction=${encodeURIComponent(auctionId)}`;
}

export function useAuctionLive(auctionId?: string): boolean {
  const dispatch = useAppDispatch();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!auctionId) return;
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      try {
        ws = new WebSocket(resolveWsUrl(auctionId));
      } catch {
        return;
      }
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        ws?.close();
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as WsMessage;
          if (msg.auction !== auctionId) return;
          if (msg.type === "offer" && msg.offer) {
            const offer = msg.offer;
            try {
              dispatch(
                offersApi.util.updateQueryData("getOffers", { auction: auctionId }, (draft) => {
                  const existing = (draft.offers || []).filter((o) => o._id !== offer._id);
                  draft.offers = [offer, ...existing].slice(0, 100);
                })
              );
            } catch {
              /* cache entry not mounted yet */
            }
            dispatch(offersApi.util.invalidateTags(["Auction"]));
          }
          if (msg.type === "round-control") {
            dispatch(offersApi.util.invalidateTags(["Auction"]));
          }
        } catch {
          /* ignore malformed frames */
        }
      };
    };

    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, [dispatch, auctionId]);

  return connected;
}
