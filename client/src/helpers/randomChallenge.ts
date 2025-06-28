import algorithms from '../components/typing/challenges/algorithms.json';
import books from '../components/typing/challenges/books.json';
import { ChallengeProps } from '../components/typing/challenges/challenge.interface';
import songs from '../components/typing/challenges/songs.json';

export const challengeItems = [
  {
    id: 0,
    name: 'Books',
    desc: 'Reveal your inner bookworm!',
  },
  {
    id: 1,
    name: 'Songs',
    desc: 'From oldies to modern songs!',
  },
  {
    id: 2,
    name: 'Algorithms',
    desc: 'CS is already tough, why bother...',
  },
  // {
  //   id: 3,
  //   name: 'test',
  //   desc: 'test',
  // },
];

export const randomChallenge = (
  challengeType: string,
  excludedChallengeId?: number,
) => {
  const currentChallengeType = challengeType.toLowerCase();
  let challenges: ChallengeProps[];
  switch (currentChallengeType) {
    case 'books':
      challenges = books;
      break;
    case 'songs':
      challenges = songs;
      break;
    case 'algorithms':
      challenges = algorithms;
      break;
    // case 'test':
    //   challenges = [
    //     {
    //       id: 0,
    //       type: 'test',
    //       title: 'test',
    //       author: 'test',
    //       content: 'test',
    //     },
    //     {
    //       id: 1,
    //       type: 'test2',
    //       title: 'test2',
    //       author: 'test2',
    //       content: 'test2',
    //     },
    //     {
    //       id: 2,
    //       type: 'test3',
    //       title: 'test3',
    //       author: 'test3',
    //       content: 'test3',
    //     },
    //   ];
    //   break;
  }
  const filteredChallenges = excludedChallengeId
    ? challenges!.filter(
        (item: ChallengeProps) => item.id !== excludedChallengeId,
      )
    : challenges!;
  return filteredChallenges[
    Math.floor(Math.random() * filteredChallenges.length)
  ];
};
