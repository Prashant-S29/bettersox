import { SearchHistory } from "~/components/feature";
import { Hero } from "~/components/section";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      <div className="mt-8">
        <SearchHistory />
      </div>
    </main>
  );
}
