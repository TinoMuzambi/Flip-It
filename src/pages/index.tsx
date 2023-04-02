/* eslint-disable @typescript-eslint/no-misused-promises */
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

import Flipper from "~/components/Flipper";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

const FlipperForm = () => {
  const { user } = useUser();
  const { register, handleSubmit, setValue } =
    useForm<RouterOutputs["flippers"]["create"]>();

  if (!user || !user.username) return null;

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.flippers.create.useMutation({
    onSuccess: () => {
      setValue("question", "");
      setValue("answer", "");
      void ctx.flippers.getAll.invalidate();
    },
    onError: (e) => {
      const questionErrorMessage = e.data?.zodError?.fieldErrors.question;
      const answerErrorMessage = e.data?.zodError?.fieldErrors.anwer;
      if (questionErrorMessage && questionErrorMessage[0]) {
        toast.error(questionErrorMessage[0]);
      } else if (answerErrorMessage && answerErrorMessage[0]) {
        {
          toast.error(answerErrorMessage[0]);
        }
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

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
        disabled={isPosting}
        {...register("question")}
      />
      <textarea
        className="resize-none rounded-md border border-slate-600 bg-transparent p-2 outline-none hover:border-slate-400 focus-visible:border-slate-400"
        placeholder="Enter an answer"
        disabled={isPosting}
        {...register("answer")}
      />

      {isPosting ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={48} />
        </div>
      ) : (
        <input
          className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-md bg-slate-400 px-4 text-slate-800 transition hover:bg-slate-800 hover:text-slate-400"
          type="submit"
          value="Add Flipper"
          disabled={isPosting}
        />
      )}
    </form>
  );
};

const Feed = () => {
  const { data, isLoading } = api.flippers.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <main>Something went wrong...</main>;
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
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
      <nav className="container mx-auto my-8 flex justify-between px-8">
        <Link href="/">
          <h1 className="text-4xl font-bold text-slate-500">Flip-It</h1>
        </Link>
        <div className="flex min-h-[48px] items-center justify-center rounded-full bg-slate-400 px-4 text-slate-800 transition hover:bg-slate-800 hover:text-slate-400">
          {isSignedIn ? <SignOutButton /> : <SignInButton />}
        </div>
      </nav>
      <main className="container mx-auto px-8">
        <FlipperForm />
        <Feed />
      </main>
    </>
  );
};

export default Home;
