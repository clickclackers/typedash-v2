import { Box, Fade } from '@chakra-ui/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { HiCursorClick } from 'react-icons/hi';
// import api from '/src/services/api';
import Word from '/src/components/typing/Word';
import TypingCaret from '/src/components/typing/TypingCaret';
import { Challenge } from '/src/services/types';
import { WordStatus } from '/src/components/typing/Word';
import { useSocket } from '/src/hooks/useSocket';
import Results from '/src/components/typing/Results';
import useAuth from '/src/hooks/useAuth';

interface MultiplayerTestProps {
  isTestStarted: boolean;
  challenge: Challenge;
  timeTaken: number | null;
}

const EXCLUDED_KEYS = new Set(['Shift', 'CapsLock']);

const MultiplayerTest: FC<MultiplayerTestProps> = ({
  isTestStarted,
  challenge,
  timeTaken,
}) => {
  const [typedWordList, setTypedWordList] = useState<string[]>(['']);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [mistypedCount, setMistypedCount] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [wrongLettersInWord, setWrongLettersInWord] = useState(0);
  const [wrongLetters, setWrongLetters] = useState<number[]>([]);
  const [showRefocusOverlay, setShowRefocusOverlay] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const { socket } = useSocket();
  const challengeText = challenge?.text ?? '';
  const letterSet = useMemo(() => challengeText.split(''), [challengeText]);
  const wordSet = useMemo(() => challengeText.split(' '), [challengeText]);
  const { user } = useAuth();

  const focusOnInput = () => {
    setShowRefocusOverlay(false);
    inputRef.current?.focus();
  };

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      restartRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isTestStarted) {
      e.preventDefault();
      return;
    }
    if (
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight'
    ) {
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (wrongLettersInWord > 0) setWrongLettersInWord(wrongLettersInWord - 1);
      const endsWithSpace = inputRef.current?.value.slice(-1) === ' ';
      if (endsWithSpace) {
        const prevIndex = Math.max(0, activeWordIndex - 1);
        const prevWordTyped = typedWordList[prevIndex];
        const prevWordTarget = wordSet[prevIndex];
        const prevWordHasErrors =
          typeof prevWordTyped === 'string' &&
          typeof prevWordTarget === 'string' &&
          prevWordTyped !== prevWordTarget;
        if (
          !prevWordHasErrors ||
          (prevIndex === 0 && prevWordTyped === undefined)
        ) {
          e.preventDefault();
        } else {
          setActiveWordIndex(prevIndex);
          setWrongLettersInWord(0);
        }
      }
    } else if (!EXCLUDED_KEYS.has(e.key)) {
      setTotalStrokes(totalStrokes + 1);
    }
  };

  // function to handle each key press
  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (wrongLettersInWord >= 10) {
      if (inputRef.current && inputRef.current.value) {
        inputRef.current.value = inputRef.current.value.slice(0, -1);
      }
      return;
    }

    const typed = e.target.value;

    const lastTypedWord = typedWordList[typedWordList.length - 1];
    const currentLetterIndex = typed.length - 1;
    if (lastTypedWord?.length >= wordSet[activeWordIndex]?.length)
      setWrongLettersInWord(wrongLettersInWord + 1);
    if (
      typed.slice(-1) !== ' ' &&
      typed.slice(-1) !== letterSet[currentLetterIndex]
    ) {
      if (!wrongLetters.includes(currentLetterIndex)) {
        setWrongLetters([...wrongLetters, currentLetterIndex]);
        setMistypedCount(mistypedCount + 1);
      }
    } else if (typed.slice(-1) === letterSet[currentLetterIndex]) {
      if (wrongLetters.includes(currentLetterIndex)) {
        const filtered = wrongLetters.filter((x) => x !== currentLetterIndex);
        setWrongLetters(filtered);
      }
    }
    // Always reflect the caret position for progress bar
    setActiveLetterIndex(typed.length);
    const parts = typed.split(' ');
    setTypedWordList(parts);

    // Advance caret on space
    setActiveWordIndex(Math.max(0, parts.length - 1));
    if (typed.slice(-1) === ' ') {
      setWrongLettersInWord(0);
    }

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'typingProgress',
          charsTyped: activeLetterIndex + 1,
        }),
      );
    }
  };

  useEffect(() => {
    if (!isInputFocused) {
      const refocusOverlayTimeout = setTimeout(() => {
        setShowRefocusOverlay(true);
      }, 1000);
      return () => clearTimeout(refocusOverlayTimeout);
    } else {
      setShowRefocusOverlay(false);
    }
  }, [isInputFocused]);

  const testComplete = timeTaken !== null;

  if (testComplete) {
    // WPM formula by MonkeyType:
    // total amount of characters in the correctly typed words (including spaces), divided by 5 and normalised to 60 seconds.
    let correctChars = 0;
    const limit = Math.min(typedWordList.length, wordSet.length);
    for (let i = 0; i < limit; i++) {
      if (typedWordList[i] === wordSet[i]) {
        // + 1 to account for the space after the word
        correctChars += wordSet[i].length + 1;
      }
    }
    correctChars = Math.max(correctChars - 1, 0);
    const minutes = timeTaken > 0 ? timeTaken / 60 : 1;
    const wpm = Math.floor(correctChars / 5 / minutes);
    const accuracy = +(
      ((totalStrokes - mistypedCount) / totalStrokes) *
      100
    ).toFixed(1);

    if (user) {
      // api.post('results_multi', {
      //   challenge_id: challenge.id,
      //   wpm,
      //   accuracy,
      //   time_taken: timeTaken,
      // });
    }

    return (
      <Results
        result={{ wpm, accuracy, time: timeTaken }}
        challenge={challenge}
        timerRanOut={false}
      />
    );
  }

  return (
    <div
      className={
        'flex flex-col justify-center items-center gap-8 text-md md:text-lg lg:text-xl relative'
      }
      ref={containerRef}
      onKeyDown={handleTab}
    >
      <Fade in={showRefocusOverlay} className='absolute z-10 cursor-default'>
        <Box
          color='text.secondary'
          onClick={focusOnInput}
          className='flex flex-row items-center gap-4'
        >
          <HiCursorClick />
          <span>Click here to refocus</span>
        </Box>
      </Fade>

      <div className='flex flex-col justify-center items-center gap-8 h-full overflow-hidden w-full'>
        <div
          ref={wordsContainerRef}
          className={`relative flex flex-wrap gap-y-2 mb-12 w-full select-none font-mono px-1 ${
            showRefocusOverlay ? 'blur-transition' : ''
          }`}
          onClick={focusOnInput}
        >
          <TypingCaret
            containerRef={wordsContainerRef}
            activeWordIndex={activeWordIndex}
            activeTypedWord={typedWordList[activeWordIndex]}
            isVisible={isInputFocused}
          />
          {wordSet.map((word, index) => (
            <Word
              key={index}
              index={index}
              word={word}
              typedWord={typedWordList[index]}
              status={
                index === activeWordIndex
                  ? WordStatus.ACTIVE
                  : index < activeWordIndex
                    ? typedWordList[index] === word
                      ? WordStatus.COMPLETED
                      : WordStatus.WRONG
                    : WordStatus.IDLE
              }
            />
          ))}
        </div>
        <input
          autoFocus
          type='text'
          onChange={handleInputOnChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsInputFocused(true);
          }}
          onBlur={() => {
            setIsInputFocused(false);
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          ref={inputRef}
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          className='absolute -z-10 border-none bg-transparent focus:outline-none caret-transparent text-transparent'
        />
      </div>
    </div>
  );
};

export default MultiplayerTest;
