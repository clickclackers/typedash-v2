import {
  Box,
  Button,
  Fade,
  SlideFade,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HiCursorClick } from 'react-icons/hi';
import { VscDebugRestart } from 'react-icons/vsc';
import useTimer from '/src/hooks/useTimer';
import ProgressBar from '/src/components/typing/ProgressBar';
import Word from '/src/components/typing/Word';
import { WordStatus } from '/src/components/typing/Word';
import Results from '/src/components/typing/Results';
import useCreateSingleplayerResults from '/src/hooks/react-query/useCreateSingleplayerResults';
import useGetChallengesByCategory from '/src/hooks/react-query/useGetChallengesByCategory';
import { Challenge } from '/src/services/types';
import useAuth from '/src/hooks/useAuth';
import CategorySelect from '/src/components/typing/CategorySelect';
import TypingCaret from '/src/components/typing/TypingCaret';

const INITIAL_TIME = 120;
const EXCLUDED_KEYS = new Set(['Shift', 'CapsLock']);

export default function SingleplayerTest() {
  const [typedWordList, setTypedWordList] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [mistypedCount, setMistypedCount] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [wrongLettersInWord, setWrongLettersInWord] = useState(0);
  const [showRefocusOverlay, setShowRefocusOverlay] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<number[]>([]);
  const [result, setResult] = useState({
    wpm: 0,
    accuracy: 0,
    time: 0,
  });
  const [time, { startTimer, pauseTimer, resetTimer }] = useTimer(INITIAL_TIME);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);

  const [categoryId, setCategoryId] = useState(
    localStorage.getItem('challenge-category')
      ? Number(localStorage.getItem('challenge-category'))
      : 1,
  );
  const { isAuthenticated } = useAuth();
  const { mutate: createSingleplayerResult } = useCreateSingleplayerResults({});
  const { data: challengesData, isLoading: isLoadingChallenges } =
    useGetChallengesByCategory({
      categoryId,
    });
  const [challenge, setChallenge] = useState<Challenge | undefined>();
  const challengeText = challenge?.text ?? '';
  const letterSet = useMemo(() => challengeText.split(''), [challengeText]);
  const wordSet = useMemo(() => challengeText.split(' '), [challengeText]);

  // generate result once test ends
  const handleTestComplete = useCallback(() => {
    if (!isTestStarted) {
      return;
    }
    setIsTestStarted(false);
    pauseTimer();
    const timeTaken = INITIAL_TIME - time;
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
    setResult({
      wpm,
      accuracy,
      time: timeTaken,
    });
    if (isAuthenticated) {
      createSingleplayerResult({
        challenge_id: challenge?.id ?? 0,
        wpm,
        accuracy,
        time_taken: timeTaken,
        created_at: new Date().toISOString(),
      });
    }
    setShowResults(true);
  }, [
    challenge?.id,
    createSingleplayerResult,
    isAuthenticated,
    isTestStarted,
    mistypedCount,
    pauseTimer,
    time,
    totalStrokes,
    typedWordList,
    wordSet,
  ]);

  const restartTest = () => {
    resetTimer();
    setIsTestStarted(false);
    setActiveWordIndex(0);
    setMistypedCount(0);
    setActiveLetterIndex(0);
    setWrongLettersInWord(0);
    setWrongLetters([]);
    setTypedWordList(['']);
    setResult({
      wpm: 0,
      accuracy: 0,
      time: 0,
    });
    setShowResults(false);
    focusOnInput();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    // TODO: filter out challenges that have been done in this session so they don't repeat
    setChallenge(
      challengesData?.challenges[
        Math.floor(Math.random() * challengesData.challenges.length)
      ],
    );
  };

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

  const preventCrtlA = (event: KeyboardEvent) => {
    // Check if the user presses either Ctrl (for Windows/Linux) or Command (for macOS) key
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isAKey = event.key === 'a' || event.keyCode === 65;
    if (isCtrlKey && isAKey) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    if (inputRef.current && wrongLettersInWord >= 10) {
      inputRef.current.value = inputRef.current.value.slice(0, -1);
      return;
    }
    if (!isTestStarted) {
      startTimer();
      setIsTestStarted(true);
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
  };

  // prevent ctrl A and backspace to delete all words
  useEffect(() => {
    document.addEventListener('keydown', preventCrtlA);

    return () => {
      document.removeEventListener('keydown', preventCrtlA);
    };
  }, []);

  useEffect(() => {
    // random challenge
    setChallenge(
      challengesData?.challenges[
        Math.floor(Math.random() * challengesData.challenges.length)
      ],
    );
  }, [challengesData]);

  // if finished word set or timer has ran out, stop the test
  useEffect(() => {
    if (
      (typedWordList.length >= wordSet.length &&
        typedWordList.at(-1) === wordSet.at(-1)) ||
      time === 0
    ) {
      handleTestComplete();
    }
  }, [handleTestComplete, time, typedWordList, wordSet]);

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

  if (isLoadingChallenges || !challenge) {
    return (
      <div className='flex justify-center items-center'>
        <Spinner
          thickness='3px'
          speed='0.65s'
          emptyColor='gray.200'
          color='accent.300'
          size='lg'
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={
          'flex flex-col justify-center items-center gap-8 text-xl relative'
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
        <div
          className={`flex flex-col justify-center items-center gap-4 h-full overflow-hidden transition w-full`}
        >
          {!showResults ? (
            <>
              <div className='w-4/5 h-4'>
                <SlideFade in={isTestStarted}>
                  <ProgressBar
                    lettersTyped={activeLetterIndex}
                    totalLetters={letterSet.length}
                  />
                </SlideFade>
              </div>
              <div
                className={`h-12 w-full flex items-center ${
                  isTestStarted ? 'justify-start' : 'justify-center'
                }`}
              >
                {isTestStarted ? (
                  <SlideFade in={isTestStarted}>
                    <Box color='accent.200'>{time}</Box>
                  </SlideFade>
                ) : (
                  <CategorySelect
                    categoryId={challenge.category_id}
                    setCategoryId={setCategoryId}
                  />
                )}
              </div>
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
            <Results
              result={result}
              challenge={challenge}
              timerRanOut={time === 0}
            />
          )}
          <Tooltip
            label='Restart Test'
            fontSize='md'
            aria-label='Restart test tooltip'
            className='font-mono'
          >
            <Button
              variant='ghost'
              onClick={restartTest}
              ref={restartRef}
              color='text.primary'
              _hover={{ color: 'text.secondary' }}
              _focus={{ color: 'text.secondary' }}
              className='p-4 transition outline-none '
              tabIndex={0}
            >
              <VscDebugRestart size={25} />
            </Button>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
