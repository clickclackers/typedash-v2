import { Box } from '@chakra-ui/react';
import { FC, memo } from 'react';

export enum WordStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WRONG = 'wrong',
}

interface WordProps {
  index: number;
  word: string;
  typedWord: string | undefined;
  status: WordStatus;
}

function Letter({ status, char }: { status: string; char: string }) {
  return (
    <Box color={`letter.${status}`} className='h-8'>
      {char}
    </Box>
  );
}

const Word: FC<WordProps> = memo(({ index, word, typedWord, status }) => {
  return (
    <div data-word-index={index} className='flex word-active h-8'>
      {word.split('').map((char, i) => {
        let letterStatus = 'idle';
        if (status === WordStatus.COMPLETED) {
          letterStatus = 'correct';
        } else if (
          status === WordStatus.ACTIVE ||
          status === WordStatus.WRONG
        ) {
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
      })}
      {typedWord &&
        typedWord.length > word.length &&
        typedWord
          .slice(word.length)
          .split('')
          .map((char, i) => {
            return <Letter key={i} status={'incorrect'} char={char} />;
          })}
      &nbsp;
    </div>
  );
});

export default Word;
