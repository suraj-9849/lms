import { HomeMarquee } from '@/components/HomeMarquee';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import GradualSpacing from '@/components/ui/gradual-spacing';

export default function Home() {
  return (
    <main className="h-screen">
      <section className="to-bg relative h-full bg-gradient-to-b from-slate-900 via-blue-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative flex h-full flex-col">
          <nav className="container px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  </svg>
                </div>
                <GradualSpacing
                  className="font-display text-center text-lg font-bold -tracking-widest text-black dark:text-white"
                  text="LMS"
                />
              </div>

              <Link href="/login">
                <Button className="text-sm text-black text-primary">Login</Button>
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 flex-col justify-center">
            <div className="container px-4">
              <div className="mx-auto max-w-3xl space-y-8 text-center">
                <h1 className="text-4xl font-bold leading-tight tracking-tighter text-white md:text-5xl lg:text-6xl">
                  Learn, Grow and Make Others Grow!
                </h1>

                <p className="mx-auto max-w-2xl text-sm text-blue-200 md:text-base lg:text-lg">
                  Seamlessly connect learners and educators with innovative tools for interactive
                  learning. Your journey to growth starts with simplified education, anytime,
                  anywhere.
                </p>

                <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-48">
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-400 hover:bg-blue-900/50 sm:w-48"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="relative mt-12 h-40">
                <HomeMarquee />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
