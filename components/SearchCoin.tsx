'use client';

import { getSearchCoins } from '@/lib/coingecko.actions';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SearchCoin = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState<CoinMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadCoins = async () => {
    if (coins.length || isLoading) return;

    setIsLoading(true);
    setError(false);
    try {
      setCoins(await getSearchCoins());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        loadCoins();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  });

  return (
    <div id='search-modal'>
      <button
        className='flex h-full cursor-pointer items-center gap-2 px-6 text-base font-medium text-purple-100 transition-all hover:bg-transparent!'
        type='button'
        onClick={() => {
          setOpen(true);
          loadCoins();
        }}
      >
        <Search size={17} aria-hidden='true' />
        <span>Search</span>
        <kbd className='pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex'>
          Ctrl K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) loadCoins();
        }}
        title='Search coins'
        description='Search for a coin by name, symbol, or ID.'
        className='p-0'
      >
        <CommandInput placeholder='Search coins...' />
        <CommandList className='max-h-100'>
          {isLoading && <CommandEmpty>Loading coins...</CommandEmpty>}
          {error && <CommandEmpty>Unable to load coins.</CommandEmpty>}
          {!isLoading &&
            !error &&
            coins.slice(0, 250).map((coin) => {
              const isUp = coin.price_change_percentage_24h >= 0;

              return (
                <CommandItem
                  key={coin.id}
                  value={`${coin.name} ${coin.symbol} ${coin.id}`}
                  className='grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[#1e2833] data-[selected=true]:bg-[#1e2833]'
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/coins/${coin.id}`);
                  }}
                >
                  <span className='flex min-w-0 items-center gap-3'>
                    <Image
                      className='size-9 shrink-0 rounded-full'
                      src={coin.image}
                      alt=''
                      width={36}
                      height={36}
                    />
                    <span className='flex min-w-0 flex-col'>
                      <strong className='truncate font-medium text-white'>
                        {coin.name}
                      </strong>
                      <span className='text-xs uppercase text-purple-100/60'>
                        {coin.symbol.toUpperCase()}
                      </span>
                    </span>
                  </span>
                  <span className='flex min-w-20 flex-col items-end gap-0.5'>
                    <span className='text-right text-xs font-medium text-purple-100 sm:text-sm'>
                      {formatCurrency(coin.current_price)}
                    </span>
                    <span
                      className={cn(
                        'flex items-center justify-end gap-1 text-xs font-medium sm:text-sm',
                        {
                          'text-green-500': isUp,
                          'text-red-500': !isUp,
                        },
                      )}
                    >
                      {isUp ? (
                        <TrendingUp className='text-green-500' size={15} />
                      ) : (
                        <TrendingDown className='text-red-500' size={15} />
                      )}
                      {isUp && '+'}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </span>
                  </span>
                </CommandItem>
              );
            })}
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default SearchCoin;
