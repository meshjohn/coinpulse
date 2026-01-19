import { fetcher } from "@/lib/coingecko.actions";
import Image from "next/image";
import { CoinOverviewFallback } from "./fallback";
import CandlestickChart from "../CandlestickChart";
import { formatCurrency } from "@/lib/utils";
import CoinChartClient from "../CoinChartClient";

const CoinOverview = async () => {
  try {
    const [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>("/coins/bitcoin", { dex_pair_format: "symbol" }),
      fetcher<OHLCData[]>("/coins/bitcoin/ohlc", {
        vs_currency: "usd",
        days: 1,
        precision: "full",
      }),
    ]);

    return (
      <div id="coin-overview">
        {/* Pass the server-fetched data into our Client Wrapper */}
        <CoinChartClient initialData={coinOHLCData} coinId="bitcoin">
          <div className="header pt-2">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={56}
              height={56}
              className="rounded-full"
            />
            <div className="info">
              <p className="text-muted-foreground">
                {coin.name} / {coin.symbol.toUpperCase()}
              </p>
              <h1 className="text-3xl font-bold">
                {formatCurrency(coin.market_data.current_price.usd)}
              </h1>
            </div>
          </div>
        </CoinChartClient>
      </div>
    );
  } catch (error) {
    console.error("Error fetching coin overview", error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
