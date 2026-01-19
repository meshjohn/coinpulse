"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { searchCoins } from "@/lib/coingecko.actions";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchModalProps {
  renderAs?: "button" | "text";
  label?: string;
  initialCoins?: SearchItemCoin[];
}

export default function SearchModal({
  renderAs = "button",
  label = "Search coins",
  initialCoins = [],
}: SearchModalProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState<SearchItemCoin[]>(initialCoins);
  const router = useRouter();

  const isSearchMode = !!searchTerm.trim();
  const displayCoins = isSearchMode ? coins : initialCoins?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = async () => {
    if (!isSearchMode) return setCoins(initialCoins);

    setLoading(true);
    try {
      const results = await searchCoins(searchTerm.trim());
      setCoins(results);
    } catch {
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectCoin = (coinId: string) => {
    setOpen(false);
    setSearchTerm("");
    setCoins(initialCoins);
    router.push(`/coins/${coinId}`);
  };

  return (
    <>
      {renderAs === "text" ? (
        <span
          onClick={() => setOpen(true)}
          className="search-text cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        >
          {label}
        </span>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="search-btn w-full justify-between text-muted-foreground"
        >
          {label}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder="Search coins..."
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>
          <CommandGroup
            heading={isSearchMode ? "Search results" : "Popular coins"}
          >
            {displayCoins.map((coin) => (
              <CommandItem
                key={coin.id}
                value={coin.name} // Important for CMDK internal filtering
                onSelect={() => handleSelectCoin(coin.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {coin.thumb ? (
                  <Image
                    src={coin.thumb}
                    alt={coin.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {coin.symbol}
                    </span>
                  </div>
                  {coin.market_cap_rank && (
                    <span className="text-xs text-muted-foreground">
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
