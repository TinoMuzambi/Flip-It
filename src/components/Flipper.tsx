import Image from "next/image";
import { useState } from "react";
import type { RouterOutputs } from "~/utils/api";

type FlipperWithUser = RouterOutputs["flippers"]["getAll"][number];

const Flipper = (props: FlipperWithUser) => {
  const [flipped, setFlipped] = useState(false);

  const { flipper, author } = props;

  return (
    <div
      className="relative flex min-h-[10rem] cursor-pointer items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
      key={flipper.id}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <Image
        src={author.profileImageUrl}
        alt={`${author.username || ""}'s profile picture`}
        width={24}
        height={24}
        className="absolute left-2 top-2 rounded-full object-cover "
      />
      {flipped ? flipper.answer : flipper.question}
    </div>
  );
};

export default Flipper;
