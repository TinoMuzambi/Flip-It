import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";

type FlipperWithUser = RouterOutputs["flippers"]["getAll"][number];

const Flipper = (props: FlipperWithUser) => {
  const { flipper, author } = props;
  return (
    <div
      className="relative flex min-h-[10rem] items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
      key={flipper.id}
    >
      <Image
        src={author.profileImageUrl}
        alt={`${author.username || ""}'s profile picture`}
        width={24}
        height={24}
        className="absolute left-2 top-2 rounded-full object-cover"
      />
      {flipper.question}
    </div>
  );
};

export default Flipper;
