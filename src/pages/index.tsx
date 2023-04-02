import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import Flipper from "~/components/Flipper";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

const FlipperForm = () => {
  const { user } = useUser();
  const { register, handleSubmit } =
    useForm<RouterOutputs["flippers"]["create"]>();

  if (!user || !user.username) return null;

  const { mutate } = api.flippers.create.useMutation();

  const onSubmit: SubmitHandler<RouterOutputs["flippers"]["create"]> = (
    data
  ) => {
    mutate({
      ...data,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="my-8 flex flex-col gap-4"
    >
      <textarea
        className="resize-none rounded-md border border-slate-600 bg-transparent p-2 outline-none hover:border-slate-400 focus-visible:border-slate-400"
        placeholder="Enter a question"
        {...register("question", {
          required: {
            value: true,
            message: "This value is required",
          },
          minLength: {
            value: 1,
            message: "Please enter a value between 3-1000 characters.",
          },
          maxLength: {
            value: 1000,
            message: "Please enter a value between 3-1000 characters.",
          },
        })}
      />
      <textarea
        className="resize-none rounded-md border border-slate-600 bg-transparent p-2 outline-none hover:border-slate-400 focus-visible:border-slate-400"
        placeholder="Enter an answer"
        {...register("answer", {
          required: {
            value: true,
            message: "This value is required",
          },
          minLength: {
            value: 1,
            message: "Please enter a value between 3-1000 characters.",
          },
          maxLength: {
            value: 1000,
            message: "Please enter a value between 3-1000 characters.",
          },
        })}
      />

      <input
        className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-md bg-slate-400 px-4 text-slate-800 transition hover:bg-slate-800 hover:text-slate-400"
        type="submit"
        value="Add Flipper"
      />
    </form>
  );
};

const Feed = () => {
  const { data, isLoading } = api.flippers.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <main>Something went wrong...</main>;
  return (
    <div className="grid grid-cols-4 gap-2">
      {data.map((fullFlipper) => (
        <Flipper {...fullFlipper} key={fullFlipper.flipper.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;

  // Start fetching ASAP
  api.flippers.getAll.useQuery();
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
          {isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </nav>
      <main className="container mx-auto">
        <FlipperForm />
        <Feed />
      </main>
    </>
  );
};

export default Home;
