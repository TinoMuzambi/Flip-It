import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data, isLoading } = api.flippers.getAll.useQuery();

  if (isLoading) return <main>Loading...</main>;

  if (!data) return <main>Something went wrong...</main>;
  return (
    <>
      <Head>
        <title>Flip-It</title>
        <meta name="description" content="Flip-It - Cue cards for devs." />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <nav className="container mx-auto my-8 flex justify-between">
        <Link href="/">
          <h1 className="text-4xl font-bold text-slate-500">Flip-It</h1>
        </Link>
        <div className="flex items-center justify-center rounded-full bg-slate-400 px-4 text-slate-800 transition hover:bg-slate-800 hover:text-slate-400">
          {user.isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </nav>
      <main className="container mx-auto">
        <div className="grid grid-cols-4 gap-2">
          {[...data, ...data, ...data, ...data, ...data].map((flipper) => (
            <div
              className="flex min-h-[10rem] items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
              key={flipper.id}
            >
              {flipper.question}
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
