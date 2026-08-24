'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error: ${response.status}: ${errorBody.error || response.statusText} `,
    );
  }

  return response.json();
}

export async function getSearchCoins(): Promise<CoinMarketData[]> {
  return fetcher<CoinMarketData[]>(
    '/coins/markets',
    {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 250,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    },
    300,
  );
}

interface PoolApiItem {
  id: string;
  attributes?: {
    address?: string;
    name?: string;
  };
}

interface PoolLiveApiData {
  data?: {
    attributes?: {
      base_token_price_usd?: string;
    };
  };
}

interface PoolTradeApiItem {
  attributes: {
    price_to_in_usd: string;
    price_from_in_usd: string;
    volume_in_usd: string;
    block_timestamp: string;
    kind: string;
    from_token_amount: string;
    to_token_amount: string;
  };
}

export async function getLiveCoinData(
  coinId: string,
  poolId?: string,
): Promise<{
  price: ExtendedPriceData;
  ohlc: OHLCData | null;
  trades: Trade[];
}> {
  const [priceData, marketData] = await Promise.all([
    fetcher<
      Record<
        string,
        {
          usd: number;
          usd_24h_change?: number;
          usd_market_cap?: number;
          usd_24h_vol?: number;
        }
      >
    >(
      '/simple/price',
      {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true,
      },
      30,
    ),
    poolId
      ? getLivePoolData(poolId)
      : fetcher<OHLCData[]>(
          `/coins/${coinId}/ohlc`,
          {
            vs_currency: 'usd',
            days: 1,
            precision: 'full',
          },
          30,
        ).then((ohlc) => ({
          ohlc: ohlc.at(-1) ?? null,
          trades: [],
          price: undefined,
        })),
  ]);

  const current = priceData[coinId];

  if (!current) {
    throw new Error(`No live price returned for ${coinId}`);
  }

  return {
    price: {
      usd: marketData.price ?? current.usd,
      coin: coinId,
      price: marketData.price ?? current.usd,
      change24h: current.usd_24h_change,
      marketCap: current.usd_market_cap,
      volume24h: current.usd_24h_vol,
      timestamp: Date.now(),
    },
    ohlc: marketData.ohlc,
    trades: marketData.trades,
  };
}

export async function getPoolOHLCData(
  poolId: string,
  days: number,
): Promise<OHLCData[]> {
  const separatorIndex = poolId.indexOf('_');
  const network = separatorIndex === -1 ? '' : poolId.slice(0, separatorIndex);
  const address = separatorIndex === -1 ? '' : poolId.slice(separatorIndex + 1);

  if (!network || !address) return [];

  const timeframe = days <= 1 ? 'minute' : days <= 30 ? 'hour' : 'day';
  const aggregate = timeframe === 'minute' ? 15 : timeframe === 'hour' ? 4 : 1;
  const candlesPerDay = timeframe === 'minute' ? 96 : 24 / aggregate;
  const limit = Math.min(1000, Math.ceil(days * candlesPerDay));
  const cutoffTimestamp = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
  const response = await fetcher<{
    data?: { attributes?: { ohlcv_list?: number[][] } };
  }>(
    `/onchain/networks/${network}/pools/${address}/ohlcv/${timeframe}`,
    {
      aggregate,
      limit,
    },
    60,
  );

  return (response.data?.attributes?.ohlcv_list ?? [])
    .filter((candle) => candle.length >= 5 && candle[0] >= cutoffTimestamp)
    .map((candle) => [
      candle[0] * 1000,
      candle[1],
      candle[2],
      candle[3],
      candle[4],
    ]);
}

async function getLivePoolData(poolId: string): Promise<{
  ohlc: OHLCData | null;
  trades: Trade[];
  price?: number;
}> {
  const separatorIndex = poolId.indexOf('_');
  const network = separatorIndex === -1 ? '' : poolId.slice(0, separatorIndex);
  const address = separatorIndex === -1 ? '' : poolId.slice(separatorIndex + 1);

  if (!network || !address) return { ohlc: null, trades: [] };

  const [poolData, ohlcData, tradesData] = await Promise.all([
    fetcher<PoolLiveApiData>(
      `/onchain/networks/${network}/pools/${address}`,
      undefined,
      60,
    ),
    fetcher<{
      data?: { attributes?: { ohlcv_list?: number[][] } };
    }>(
      `/onchain/networks/${network}/pools/${address}/ohlcv/minute`,
      {
        aggregate: 15,
        limit: 2,
        include_empty_intervals: true,
      },
      60,
    ),
    fetcher<{ data?: PoolTradeApiItem[] }>(
      `/onchain/networks/${network}/pools/${address}/trades`,
      undefined,
      60,
    ),
  ]);

  const latest = ohlcData.data?.attributes?.ohlcv_list?.[0];
  const poolPrice = Number(
    poolData.data?.attributes?.base_token_price_usd ?? 0,
  );
  const currentPrice = poolPrice > 0 ? poolPrice : latest?.[4];
  const currentBucket = Math.floor(Date.now() / 900) * 900;

  return {
    ohlc:
      latest && latest.length >= 5 && currentPrice
        ? [
            currentBucket,
            latest[4],
            Math.max(latest[2], currentPrice),
            Math.min(latest[3], currentPrice),
            currentPrice,
          ]
        : null,
    price: currentPrice,
    trades: (tradesData.data ?? [])
      .map(({ attributes }) => {
        const isBuy = attributes.kind === 'buy';

        return {
          price: Number(
            isBuy ? attributes.price_to_in_usd : attributes.price_from_in_usd,
          ),
          value: Number(attributes.volume_in_usd),
          timestamp: Date.parse(attributes.block_timestamp),
          type: isBuy ? 'b' : 's',
          amount: Number(
            isBuy ? attributes.to_token_amount : attributes.from_token_amount,
          ),
        };
      })
      .sort((first, second) => (second.timestamp ?? 0) - (first.timestamp ?? 0))
      .slice(0, 7),
  };
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolApiItem[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return normalizePool(poolData.data?.[0], network) ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolApiItem[] }>(
      '/onchain/search/pools',
      { query: id },
    );

    return normalizePool(poolData.data?.[0]) ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizePool(
  pool: PoolApiItem | undefined,
  knownNetwork?: string,
): PoolData | null {
  if (!pool?.id) return null;

  const separatorIndex = pool.id.indexOf('_');
  const network = knownNetwork || pool.id.slice(0, separatorIndex);
  const address = pool.attributes?.address || pool.id.slice(separatorIndex + 1);

  if (!network || !address) return null;

  return {
    id: `${network}_${address}`,
    address,
    name: pool.attributes?.name || '',
    network,
  };
}
