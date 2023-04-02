import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data } = api.flippers.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        {user.isSignedIn ? <SignOutButton /> : <SignInButton />}
        <div>
          {data?.map((flipper) => (
            <div key={flipper.id}>flipper.question</div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
