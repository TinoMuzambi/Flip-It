import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data } = api.flippers.getAll.useQuery();
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
        <div className="grid grid-cols-4">
          {data?.map((flipper) => (
            <div
              className="rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4"
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
