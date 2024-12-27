import { HomeMarquee } from '@/components/HomeMarquee';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import GradualSpacing from '@/components/ui/gradual-spacing';

export default function Home() {
  return (
    <main>
      <section className="to-bg relative bg-gradient-to-b from-slate-900 via-blue-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative">
          <div className="container px-4 py-8">
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
                  className="font-display text-center text-xl font-bold -tracking-widest text-black dark:text-white md:text-xl md:leading-[5rem]"
                  text="LMS"
                />
              </div>
              <Button className="text-primary">
                <Link href="/login" className="dark:text-black">
                  Login
                </Link>
              </Button>
            </div>

            <div className="mx-auto mt-16 max-w-3xl pl-5 text-center">
              <h1 className="text-4xl font-bold leading-tight tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Learn, Grow and Make Others Grow!
              </h1>

              <p className="mt-6 text-lg text-blue-200">
                Seamlessly connect learners and educators with innovative tools for interactive
                learning. Your journey to growth starts with simplified education, anytime,
                anywhere.
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href={'/login'}>Get Started </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-400 hover:bg-blue-900/50"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative mb-10 mt-10 h-60 w-full md:h-60">
              <HomeMarquee />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
