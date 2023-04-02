import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import Link from "next/link";
import Flipper from "~/components/Flipper";
import { api } from "~/utils/api";

const FlipperForm = () => {
  const { user } = useUser();

  if (!user || !user.username) return null;

  return (
    <form className="my-8 flex flex-col gap-4">
      <textarea
        className="resize-none rounded-md border border-slate-600 bg-transparent p-2 outline-none hover:border-slate-400 focus-visible:border-slate-400"
        placeholder="Enter a question"
      />
      <textarea
        className="resize-none rounded-md border border-slate-600 bg-transparent p-2 outline-none hover:border-slate-400 focus-visible:border-slate-400"
        placeholder="Enter an answer"
      />

      <input
        className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-md bg-slate-400 px-4 text-slate-800 transition hover:bg-slate-800 hover:text-slate-400"
        type="submit"
        value="Add Flipper"
      />
    </form>
  );
};

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
        <div className="flex min-h-[48px] items-center justify-center rounded-full bg-slate-400 px-4 text-slate-800 transition hover:bg-slate-800 hover:text-slate-400">
          {user.isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </nav>
      <main className="container mx-auto">
        <FlipperForm />
        <div className="grid grid-cols-4 gap-2">
          {[...data, ...data, ...data, ...data, ...data].map((fullFlipper) => (
            <Flipper {...fullFlipper} key={fullFlipper.flipper.id} />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
