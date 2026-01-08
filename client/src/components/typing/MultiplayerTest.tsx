import { Box, Fade } from '@chakra-ui/react';
import { FC, useEffect, useRef, useState } from 'react';
import { HiCursorClick } from 'react-icons/hi';
import useTimer from '/src/hooks/useTimer';
// import api from '/src/services/api';
import Word from '/src/components/typing/Word';
import TypingCaret from '/src/components/typing/TypingCaret';
import { Challenge } from '/src/services/types';
import Result from '/src/components/typing/Result';
import useAuth from '/src/hooks/useAuth';
import { WordStatus } from '/src/components/typing/Word';
import { useSocket } from '/src/hooks/useSocket';

interface MultiplayerTestProps {
  isTestStarted: boolean;
  challenge: Challenge;
}

const INITIAL_TIME = 120;
const EXCLUDED_KEYS = new Set(['Shift', 'CapsLock']);

const MultiplayerTest: FC<MultiplayerTestProps> = ({
  isTestStarted,
  challenge,
}) => {
  const [typedWordList, setTypedWordList] = useState<string[]>(['']);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [mistypedCount, setMistypedCount] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [wrongLettersInWord, setWrongLettersInWord] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<number[]>([]);
  const [result, setResult] = useState({
    wpm: 0,
    accuracy: 0,
    time: 0,
  });
  const [showRefocusOverlay, setShowRefocusOverlay] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [time, { startTimer, pauseTimer }] = useTimer(INITIAL_TIME);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const letterSet = challenge?.text.split('') ?? [];
  const wordSet = challenge?.text.split(' ') ?? [];

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
    } else if (e.key === ' ') {
      // Always advance to next word on space and reset wrong-letter counter
      setActiveWordIndex(typedWordList.length);
      setWrongLettersInWord(0);
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
  const handleKeyPress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestStarted) {
      e.preventDefault();
      return;
    }
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

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'typingProgress',
          charsTyped: activeLetterIndex + 1,
        }),
      );
    }
  };

  // if finished word set, stop the test
  useEffect(() => {
    if (
      typedWordList.length >= wordSet.length &&
      typedWordList.at(-1) === wordSet.at(-1)
    ) {
      pauseTimer();
      const timeTaken = INITIAL_TIME - time;
      const WPM = Math.floor((wordSet.length / timeTaken) * 60);
      const accuracy = +(
        ((totalStrokes - mistypedCount) / totalStrokes) *
        100
      ).toFixed(2);
      setResult({
        wpm: WPM,
        accuracy,
        time: timeTaken,
      });
      // TODO: Save results for authenticated users
      if (user) {
        // api.post('results_multi', {
        //   challenge_id: challenge?.id,
        //   wpm: WPM,
        //   accuracy,
        //   time_taken: timeTaken,
        // });
      }
      setShowResults(true);
    }
  }, [typedWordList, wordSet]);

  useEffect(() => {
    if (isTestStarted) {
      startTimer();
    }
  }, [isTestStarted]);

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

  return (
    <div
      className={
        'flex flex-col justify-center items-center gap-8 text-md md:text-lg lg:text-xl relative'
      }
      ref={containerRef}
      onKeyDown={handleTab}
    >
      <Fade
        in={showRefocusOverlay && !showResults}
        className='absolute z-10 cursor-default'
      >
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
        {!showResults ? (
          <>
            <Box color='accent.200' className='w-full flex justify-start'>
              {time}
            </Box>
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
                      : index < activeWordIndex && typedWordList[index] === word
                        ? WordStatus.COMPLETED
                        : WordStatus.IDLE
                  }
                />
              ))}
            </div>
            <input
              autoFocus
              type='text'
              onChange={handleKeyPress}
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
          </>
        ) : (
          <Result
            result={result}
            challenge={challenge}
            timerRanOut={time === 0}
          />
        )}
      </div>
    </div>
  );
};

export default MultiplayerTest;
