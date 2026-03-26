import { AuctionList } from "@/features/auctions/components/AuctionList";

export function AuctionsPage() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leilões abertos</h2>
          <p className="text-sm text-slate-600">Explore os leilões disponíveis e entre na disputa.</p>
        </div>
      </div>

      <AuctionList />
    </section>
  );
}
