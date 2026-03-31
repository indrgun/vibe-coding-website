import AnimatedBackground from "@/components/AnimatedBackground";
import VerseDisplay from "@/components/VerseDisplay";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <VerseDisplay />
    </main>
  );
}
