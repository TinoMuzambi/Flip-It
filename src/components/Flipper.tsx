import Image from "next/image";

import type { RouterOutputs } from "~/utils/api";

type FlipperWithUser = RouterOutputs["flippers"]["getAll"][number];

const Flipper = (props: FlipperWithUser) => {
  const { flipper, author } = props;

  return (
    <div className="group [perspective:1000px]">
      <div
        className="relative flex min-h-[10rem] cursor-pointer items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
        key={flipper.id}
      >
        <Image
          src={author.profileImageUrl}
          alt={`${author.username || ""}'s profile picture`}
          width={24}
          height={24}
          className="absolute left-2 top-2 rounded-full object-cover "
        />
        <p> {flipper.question}</p>

        <div className="absolute flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p> {flipper.answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Flipper;
