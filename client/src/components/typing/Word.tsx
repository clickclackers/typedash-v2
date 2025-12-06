import { FC, memo } from 'react';
import Caret from '/src/components/typing/Caret';
import Letter from '/src/components/typing/Letter';
import { WordStatus } from '/src/components/typing/wordStatus';

interface WordProps {
  word: string;
  typedWord: string | undefined;
  status: WordStatus;
}

const Word: FC<WordProps> = memo(({ word, typedWord, status }) => {
  const offset = [12, -3];
  const letters = word.split('').map((char, i) => {
    let letterStatus = 'idle';
    if (status === WordStatus.COMPLETED) {
      letterStatus = 'correct';
    } else if (status === WordStatus.ACTIVE || status === WordStatus.WRONG) {
      if (typedWord?.charAt(i) === char) {
        letterStatus = 'correct';
      } else if (typedWord?.charAt(i) !== char && typedWord?.charAt(i)) {
        letterStatus = 'incorrect';
      } else if (
        status === WordStatus.WRONG &&
        typedWord !== word &&
        i === typedWord?.length &&
        typedWord.length < word.length
      ) {
        // Highlight the next target character as incorrect for previously submitted wrong words
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
  const caretOffset = offset[0] * (typedWord?.length ?? 0) || offset[1];
  return (
    <div className='flex word-active h-8'>
      {status === WordStatus.ACTIVE && <Caret offset={caretOffset} />}
      {letters}
      {typedWord && typedWord.length > word.length && wrongLetters}
      &nbsp;
    </div>
  );
});

export default Word;
