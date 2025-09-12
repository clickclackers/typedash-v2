import { CheckIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SlideFade,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { FC, useEffect, useRef, useState } from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { HiCursorClick } from 'react-icons/hi';
import { VscDebugRestart } from 'react-icons/vsc';
import { useOutletContext } from 'react-router-dom';
import { challengeItems, randomChallenge } from '/src/helpers/randomChallenge';
import useTimer from '/src/helpers/useTimer';
import http from '/src/services/api';
import ProgressBar from '/src/components/typing/ProgressBar';
import Word from '/src/components/typing/Word';
import { WordStatus } from '/src/components/typing/wordStatus';
import { Challenge } from '/src/components/typing/challenges/challenge.interface';
import Result from '/src/components/typing/results/Result';
import { useAuth } from '/src/context/AuthContext';

const DEFAULT_TEST_DURATION = 120;
const EXCLUDED_KEYS = new Set(['Shift', 'CapsLock']);

const TypingTest: FC = () => {
  const [challenge, setChallenge] = useState<Challenge>();
  const [wordSet, setWordSet] = useState<string[]>([]);
  const [letterSet, setLetterSet] = useState<string[]>([]);
  const [typedWordList, setTypedWordList] = useState<string[]>(['']);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [mistypedCount, setMistypedCount] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [testStatus, setTestStatus] = useState(0); // -1: test end, 0: waiting for test to start, 1: test ongoing
  const [timeTaken, setTimeTaken] = useState(0);
  const [wrongLettersInWord, setWrongLettersInWord] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<number[]>([]);
  const [result, setResult] = useState({
    wpm: 0,
    accuracy: 0,
    time: 0,
  });
  const [time, { startTimer, pauseTimer, resetTimer }] = useTimer(
    DEFAULT_TEST_DURATION,
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [middleContainerRef] = useOutletContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const challengeSwitchRef = useRef<HTMLButtonElement>(null);
  const challengeOptionRef = useRef<Array<HTMLButtonElement | null>>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();

  const getDefaultChallengeType = () => {
    const storedChallenge = localStorage.getItem('challenge-type');
    if (storedChallenge !== null) return storedChallenge;
    else return 'Books';
  };

  const [challengeType, setChallengeType] = useState(getDefaultChallengeType());

  useEffect(() => {
    const challenge = randomChallenge(challengeType);
    setChallenge(challenge);
  }, [challengeType]);

  useEffect(() => {
    if (challenge) {
      setLetterSet(challenge.content.split(''));
      setWordSet(challenge.content.split(' '));
    }
  }, [challenge]);

  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      const themeModal = document.querySelector('#chakra-modal-theme-modal');
      if (showResults) return;
      if (
        challengeSwitchRef.current?.contains(e.target as Node) ||
        challengeOptionRef.current[0]?.contains(e.target as Node) ||
        challengeOptionRef.current[1]?.contains(e.target as Node) ||
        challengeOptionRef.current[2]?.contains(e.target as Node) ||
        themeModal?.contains(e.target as Node)
      )
        return;
      if (
        middleContainerRef.current &&
        !middleContainerRef.current.contains(e.target as Node)
      ) {
        setTimeout(() => setIsFocused(false), 1000);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [containerRef]);

  // if finished word set or timer has ran out, stop the test
  useEffect(() => {
    if (
      (typedWordList.length >= wordSet.length &&
        typedWordList.at(-1) === wordSet.at(-1)) ||
      time === 0
    ) {
      pauseTimer();
      setTestStatus(-1);
      setTimeTaken(DEFAULT_TEST_DURATION - time);
    }
  }, [typedWordList, wordSet, time]);

  // generate result once test ends
  useEffect(() => {
    if (testStatus !== -1) return;
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
    const minutes = timeTaken > 0 ? timeTaken / 60 : 1;
    const WPM = Math.floor((correctChars - 1) / 5 / minutes); // - 1 to account for no space at the end of the last word
    const accuracy = +(
      ((totalStrokes - mistypedCount) / totalStrokes) *
      100
    ).toFixed(1);
    setResult({
      wpm: WPM,
      accuracy,
      time: timeTaken,
    });
    if (user) {
      const params = {
        challenge_id: challenge?.id,
        type: challengeType,
        wpm: WPM,
        accuracy,
        time_taken: timeTaken,
        datetime: new Date().toString(),
        username: user.username,
      };
      http().post('/results/create', params);
    }
    setShowResults(true);
  }, [testStatus]);

  const restartTest = () => {
    resetTimer();
    setTestStatus(0);
    setTypedWordList(['']);
    setActiveWordIndex(0);
    setMistypedCount(0);
    setActiveLetterIndex(0);
    setTimeTaken(0);
    setWrongLettersInWord(0);
    setWrongLetters([]);
    setResult({
      wpm: 0,
      accuracy: 0,
      time: 0,
    });
    setShowResults(false);
    focusOnInput();
    clearInput();
    setChallenge(randomChallenge(challengeType, challenge?.id));
  };

  const focusOnInput = () => {
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      restartRef.current?.focus();
    }
    // inputRef.current?.focus();
  };

  const preventCrtlA = (event: KeyboardEvent) => {
    // Check if the user presses either Ctrl (for Windows/Linux) or Command (for macOS) key
    const isCtrlKey = event.ctrlKey || event.metaKey;

    // Check if the user presses the 'A' key
    const isAKey = event.key === 'a' || event.keyCode === 65;

    if (isCtrlKey && isAKey) {
      // Prevent the default behavior (selecting all text)
      event.preventDefault();
    }
  };

  // prevent ctrl A and backspace to delete all words
  useEffect(() => {
    document.addEventListener('keydown', preventCrtlA);

    return () => {
      document.removeEventListener('keydown', preventCrtlA);
    };
  }, []);

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
    if (testStatus === 0) {
      startTimer();
      setTestStatus(1);
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

  const handleChallengeTypeSwitch = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const challengeType = e.currentTarget.value;
    setChallengeType(challengeType);
    onClose();
    localStorage.setItem('challenge-type', challengeType);
  };

  return (
    <>
      <div
        className={
          'flex flex-col justify-center items-center gap-8 text-xl relative'
        }
        ref={containerRef}
        onKeyDown={handleTab}
        onClick={focusOnInput}
      >
        {!isFocused && !showResults && (
          <Box
            color='text.secondary'
            onClick={focusOnInput}
            className='flex items-center gap-4 absolute z-10'
          >
            <HiCursorClick /> Click here to refocus
          </Box>
        )}
        <div
          className={`flex flex-col justify-center items-center gap-4 h-full overflow-hidden ${
            !isFocused ? 'blur-sm' : ''
          } transition w-full`}
        >
          {!showResults ? (
            <>
              <div className='w-4/5 h-4'>
                <SlideFade in={testStatus === 1}>
                  <ProgressBar
                    lettersTyped={activeLetterIndex}
                    totalLetters={letterSet.length}
                  />
                </SlideFade>
              </div>
              <div
                className={`h-12 w-full flex items-center ${
                  testStatus === 1 ? 'justify-start' : 'justify-center'
                }`}
              >
                {testStatus === 1 && (
                  <SlideFade in={testStatus === 1}>
                    <Box color='accent.200'>{time}</Box>
                  </SlideFade>
                )}
                {testStatus === 0 && (
                  <Button
                    color='text.primary'
                    ref={challengeSwitchRef}
                    iconSpacing={3}
                    leftIcon={<FaKeyboard size={20} />}
                    variant='ghost'
                    onClick={onOpen}
                    colorScheme='primary'
                  >
                    {challengeType}
                  </Button>
                )}
              </div>
              <div
                className='flex flex-wrap h-1/2 md:h-1/5 lg:sm:h-1/6 content-start 2xl:gap-y-4 mb-12 w-full select-none'
                onClick={focusOnInput}
              >
                {wordSet.map((word, index) => (
                  <Word
                    key={index}
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
                onPasteCapture={(e) => e.preventDefault()}
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
              showResults={showResults}
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
      <Modal onClose={onClose} isOpen={isOpen} isCentered size='2xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Challenge Type</ModalHeader>
          <ModalBody className='flex flex-col gap-2'>
            {challengeItems.map((type, i) => (
              <Button
                key={i}
                ref={(el) => (challengeOptionRef.current[i] = el)}
                leftIcon={challengeType === type.name ? <CheckIcon /> : <div />}
                onClick={handleChallengeTypeSwitch}
                value={type.name}
              >
                <div className='w-full flex justify-between'>
                  <div>{type.name}</div>
                  <div>{type.desc}</div>
                </div>
              </Button>
            ))}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default TypingTest;
