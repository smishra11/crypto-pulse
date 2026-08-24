import { useState, useEffect } from 'react';
import { getLiveCoinData } from '@/lib/coingecko.actions';

const POLL_INTERVALS = {
  '1m': 60_000,
  '5m': 300_000,
} as const;

export const useCoinGeckoWebSocket = ({
  coinId,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const liveData = await getLiveCoinData(coinId, poolId);
        if (cancelled) return;

        setPrice(liveData.price);
        setTrades(liveData.trades);
        setIsConnected(true);

        if (liveData.ohlc) {
          const latest = liveData.ohlc;
          setOhlcv(latest);
        }
      } catch (error) {
        if (!cancelled) {
          setIsConnected(false);
          console.error('Failed to fetch live coin data', error);
        }
      }
    };

    poll();

    const intervalId = window.setInterval(
      poll,
      POLL_INTERVALS[liveInterval ?? '1m'],
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [coinId, poolId, liveInterval]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
};
