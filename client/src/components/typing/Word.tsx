import { FC, memo } from 'react';
import Caret from './Caret';
import Letter from './Letter';

interface WordProps {
  word: string;
  typedWord: string;
  status: string;
}

const Word: FC<WordProps> = ({ word, typedWord, status }) => {
  // const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
  // const [isLargerThan1024] = useMediaQuery('(min-width: 1024px');
  // const calculateOffset = () => {
  //   if (isLargerThan1024) return [12, -3];
  //   else if (isLargerThan768) return [10.7, -2.7];
  //   else return [9.64, -1.5];
  // };
  const offset = [12, -3];
  const letters = word.split('').map((char, i) => {
    let letterStatus = 'idle';
    if (status === 'completed') {
      letterStatus = 'correct';
    } else if (status === 'active') {
      if (typedWord?.charAt(i) === char) {
        letterStatus = 'correct';
      } else if (typedWord?.charAt(i) !== char && typedWord?.charAt(i)) {
        letterStatus = 'incorrect';
      }
    }
    return <Letter key={i} status={letterStatus} char={char} />;
  });
  const wrongLetters = typedWord
    ?.slice(word.length)
    .split('')
    .map((char, i) => {
      return <Letter key={i} status={'incorrect'} char={char} />;
    });
  return (
    <div className={`flex word-active h-8`}>
      {status === 'active' && (
        <Caret offset={offset[0] * typedWord?.length || offset[1]} />
      )}
      {letters}
      {typedWord?.length > word.length && wrongLetters}
      &nbsp;
    </div>
  );
};

export default memo(Word);
