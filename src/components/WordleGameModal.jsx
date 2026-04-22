import { useEffect, useMemo, useRef, useState } from "react";
import { GardenTierPreview } from "./GardenRewardsLayer";
import { getGardenTier, getNextTierUnlock } from "../data/gardenTiers";
import {
  finishWordleGame,
  getGardenProgress,
  getCurrentWordleGame,
  getToday,
  startWordleGame,
  updateWordleGame,
} from "../utils/localStorage";
import {
  WORDLE_MAX_ATTEMPTS,
  calculateWordlePoints,
  evaluateWordGuess,
  getDailyWordAnswer,
  getNextWordleAvailableLabel,
  isValidWordGuess,
  normalizeWordGuess,
} from "../utils/wordle";

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

// ─────────────────────────────────────────────
// Help overlay
// Rendered OUTSIDE .wordle-modal (as a sibling inside the fixed backdrop)
// so it always covers the full visible viewport regardless of modal scroll.
// ─────────────────────────────────────────────
function WordleHelpOverlay({ onClose }) {
  return (
    <div className="wordle-help-overlay" onClick={onClose}>
      <div className="wordle-help-card" onClick={(event) => event.stopPropagation()}>
        <div className="wordle-help-header">
          <h3>How the garden puzzle works</h3>
          <button type="button" onClick={onClose} aria-label="Close instructions">
            ×
          </button>
        </div>

        <div className="wordle-help-section">
          <h4>How to play</h4>
          <p>Choose a 4-letter word or a 5-letter word and solve it in 6 attempts.</p>
          <p>
            <span className="help-chip green">Green</span> means the letter is correct and
            in the correct place.
          </p>
          <p>
            <span className="help-chip orange">Orange</span> means the letter is in the word
            but in the wrong place.
          </p>
          <p>
            <span className="help-chip gray">Gray</span> means the letter is not in the word.
          </p>
          <p>You can play only once per day.</p>
        </div>

        <div className="wordle-help-section">
          <h4>Points</h4>
          <p>4-letter win = 1 point</p>
          <p>5-letter win = 2 points</p>
          <p>Win in fewer than 4 attempts = +1 bonus point</p>
          <p>Fail the puzzle = 0 points</p>
        </div>

        <div className="wordle-help-section">
          <h4>Tier rewards</h4>
          <p>
            Points increase your tier and every tier unlocks new life in the garden and
            background.
          </p>
          <GardenTierPreview />
        </div>

        <p className="wordle-help-note">
          Play daily to grow your garden and unlock more life in the scene.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Single tile row on the game board
// ─────────────────────────────────────────────
function WordleRow({ letters, statuses, length, active = false }) {
  return (
    <div className="wordle-row">
      {Array.from({ length }).map((_, index) => (
        <span
          key={index}
          className={[
            "wordle-tile",
            statuses?.[index] ? `state-${statuses[index]}` : "",
            letters?.[index] ? "filled" : "",
            active && !letters?.[index] ? "active-empty" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {letters?.[index] ?? ""}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// On-screen keyboard
// Tracks the best colour state for each letter across all submitted guesses.
// ─────────────────────────────────────────────
function WordleKeyboard({ guesses, disabled, onKeyPress }) {
  const letterStates = {};
  const priority = { miss: 1, near: 2, hit: 3 };

  guesses.forEach((entry) => {
    entry.guess.split("").forEach((letter, index) => {
      const nextState = entry.statuses[index];
      const previousState = letterStates[letter];
      if (!previousState || priority[nextState] > priority[previousState]) {
        letterStates[letter] = nextState;
      }
    });
  });

  return (
    <div className="wordle-keyboard" aria-label="On-screen keyboard">
      {KEYBOARD_ROWS.map((row) => (
        <div key={row.join("-")} className="wordle-keyboard-row">
          {row.map((key) => {
            const special = key === "enter" || key === "backspace";
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKeyPress(key)}
                className={[
                  "wordle-key",
                  special ? "special" : "",
                  !special && letterStates[key] ? `state-${letterStates[key]}` : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {key === "backspace" ? "⌫" : key === "enter" ? "Enter" : key.toUpperCase()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────
function WordleGameModal({ open, onClose, onProgressChange }) {
  const [gameState, setGameState] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef(null);

  // Re-read progress whenever the modal opens or the game state changes.
  const progress = useMemo(() => getGardenProgress(), [open, gameState]);
  const todayGame = progress.currentGame;
  const todayResult = progress.todayResult;
  const totalPoints = progress.totalPoints;
  const tier = getGardenTier(totalPoints);
  const nextUnlock = getNextTierUnlock(totalPoints);

  // Initialise local game state whenever the modal is opened.

  useEffect(() => {
    if (!open) return;
    setGameState(getCurrentWordleGame());
    setCurrentGuess("");
    setNotice("");
    setShowHelp(false);
  }, [open]);

  // Focus the hidden text input so physical keyboard works immediately.

  useEffect(() => {
    if (!open || !gameState || showHelp) return;
    inputRef.current?.focus();
  }, [open, gameState, showHelp]);

  if (!open) return null;

  const guesses = gameState?.guesses ?? [];
  const mode = gameState?.mode ?? null;
  const attemptsLeft = WORDLE_MAX_ATTEMPTS - guesses.length;
  const locked = !todayGame && !!todayResult;
  const inputDisabled = !gameState || locked;

  // Re-focus the text input after virtual keyboard interactions.
  function focusInputSoon() {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  // ── Game actions ──────────────────────────────

  function handleStart(modeLength) {
    const dateKey = getToday();
    const answer = getDailyWordAnswer(dateKey, modeLength);
    const nextGame = {
      date: dateKey,
      mode: modeLength,
      answer,
      guesses: [],
      status: "in_progress",
    };
    startWordleGame(nextGame);
    setGameState(nextGame);
    setCurrentGuess("");
    setNotice("");
    onProgressChange?.();
  }

  function appendLetter(letter) {
    if (!gameState) return;
    setCurrentGuess((value) => {
      if (value.length >= gameState.mode) return value;
      return `${value}${letter}`;
    });
  }

  function removeLetter() {
    setCurrentGuess((value) => value.slice(0, -1));
  }

  function finalizeGame({ solved, nextGuesses, finalGuess }) {
    if (!gameState) return;

    const attemptsUsed = nextGuesses.length;
    const pointsEarned = calculateWordlePoints({
      solved,
      mode: gameState.mode,
      attemptsUsed,
    });

    const result = finishWordleGame({
      date: gameState.date,
      mode: gameState.mode,
      answer: gameState.answer,
      guesses: nextGuesses,
      status: solved ? "won" : "lost",
      solved,
      pointsEarned,
      attemptsUsed,
      finalGuess,
    });

    setGameState(null);
    setCurrentGuess("");
    setNotice(
      solved
        ? `You solved it and earned ${pointsEarned} point${pointsEarned === 1 ? "" : "s"}.`
        : `No points today. The word was ${result.answer.toUpperCase()}.`
    );
    onProgressChange?.();
  }

  function submitGuess() {
    if (!gameState) return;

    const guess = normalizeWordGuess(currentGuess);

    if (guess.length !== gameState.mode) {
      setNotice(`Enter a full ${gameState.mode}-letter word.`);
      return;
    }

    if (!isValidWordGuess(guess, gameState.mode)) {
      setNotice(
        `That is not a valid ${gameState.mode}-letter English word in the puzzle dictionary.`
      );
      return;
    }

    const statuses = evaluateWordGuess(guess, gameState.answer);
    const nextGuesses = [...guesses, { guess, statuses }];
    const solved = guess === gameState.answer;

    if (solved || nextGuesses.length >= WORDLE_MAX_ATTEMPTS) {
      finalizeGame({ solved, nextGuesses, finalGuess: guess });
      return;
    }

    const nextGame = { ...gameState, guesses: nextGuesses };
    updateWordleGame(nextGame);
    setGameState(nextGame);
    setCurrentGuess("");
    setNotice("");
  }

  // ── Input handlers ────────────────────────────

  function handleVirtualKey(key) {
    // Virtual keyboard is a no-op while help is visible.
    if (!gameState || showHelp) return;

    if (key === "enter") {
      submitGuess();
      focusInputSoon();
      return;
    }
    if (key === "backspace") {
      removeLetter();
      focusInputSoon();
      return;
    }
    if (!/^[a-z]$/.test(key)) return;
    appendLetter(key);
    focusInputSoon();
  }

  function handleInputChange(event) {
    if (!gameState) return;
    const nextValue = normalizeWordGuess(event.target.value).slice(0, gameState.mode);
    setCurrentGuess(nextValue);
  }

  // FIX: guard against showHelp — physical keyboard must not alter game state
  // while the help panel is open (Enter was previously triggering submitGuess).
  function handleInputKeyDown(event) {
    if (!gameState || showHelp) return;

    if (event.key === "Enter") {
      event.preventDefault();
      submitGuess();
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      return;
    }
    if (event.key.length === 1 && !/[a-zA-Z]/.test(event.key)) {
      event.preventDefault();
    }
  }

  // FIX: guard against showHelp — form submit should not fire during help.
  function handleSubmit(event) {
    event.preventDefault();
    if (showHelp) return;
    submitGuess();
  }

  // ── Board rows ────────────────────────────────

  const rows = Array.from({ length: WORDLE_MAX_ATTEMPTS }).map((_, index) => {
    if (guesses[index]) {
      return {
        letters: guesses[index].guess.toUpperCase().split(""),
        statuses: guesses[index].statuses,
        active: false,
      };
    }
    if (gameState && index === guesses.length) {
      return {
        letters: currentGuess.toUpperCase().split(""),
        statuses: null,
        active: true,
      };
    }
    return { letters: [], statuses: null, active: false };
  });

  return (
    <div
      className="wordle-modal-backdrop"
      onClick={showHelp ? undefined : onClose}
    >
      <div className="wordle-modal" onClick={(event) => event.stopPropagation()}>
        {/* ── Header ── */}
        <div className="wordle-modal-header">
          <div>
            <p className="wordle-kicker">Daily Garden Puzzle</p>
            <h2>Leaf Letter</h2>
          </div>
          <div className="wordle-header-actions">
            <button
              type="button"
              className="wordle-help-button"
              onClick={() => setShowHelp(true)}
              aria-label="Open puzzle help"
            >
              ?
            </button>
            <button
              type="button"
              className="wordle-close-button"
              onClick={onClose}
              aria-label="Close puzzle"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div className="wordle-status-bar">
          <span>Total points: {totalPoints}</span>
          <span>Tier: {tier}</span>
          <span>
            {nextUnlock
              ? `Next unlock: Tier ${nextUnlock.tier}`
              : "All listed rewards unlocked"}
          </span>
        </div>

        {/* ── Result banner (shown after a completed game) ── */}
        {todayResult ? (
          <div className={`wordle-result-banner ${todayResult.solved ? "win" : "lose"}`}>
            <strong>
              {todayResult.solved
                ? "Today's puzzle is complete."
                : "Today's puzzle is over."}
            </strong>
            <span>
              {todayResult.solved
                ? `You earned ${todayResult.pointsEarned} point${
                    todayResult.pointsEarned === 1 ? "" : "s"
                  }.`
                : "No points earned today."}
            </span>
          </div>
        ) : null}

        {/* ── Mode picker (shown before a game starts) ── */}
        {!todayGame && !locked ? (
          <div className="wordle-mode-picker">
            <p>Choose today's puzzle:</p>
            <div className="wordle-mode-actions">
              <button type="button" onClick={() => handleStart(4)}>
                4-letter mode
              </button>
              <button type="button" onClick={() => handleStart(5)}>
                5-letter mode
              </button>
            </div>
            <p className="wordle-mode-note">
              One game per day. 4-letter wins give 1 point, 5-letter wins give 2 points,
              and wins in fewer than 4 attempts earn a bonus point.
            </p>
          </div>
        ) : null}

        {/* ── Active game ── */}
        {gameState ? (
          <div className="wordle-game-shell">
            <div className="wordle-game-meta">
              <span>Mode: {mode}-letter</span>
              <span>Remaining attempts: {attemptsLeft}</span>
            </div>

            <div className="wordle-board">
              {rows.map((row, index) => (
                <WordleRow
                  key={index}
                  letters={row.letters}
                  statuses={row.statuses}
                  length={mode}
                  active={row.active}
                />
              ))}
            </div>

            {/* Hidden text input captures physical keyboard input */}
            <form className="wordle-input-row" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={currentGuess.toUpperCase()}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                disabled={inputDisabled}
                maxLength={mode}
                placeholder={`Type a ${mode}-letter word`}
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={inputDisabled || currentGuess.length !== mode}
              >
                Guess
              </button>
            </form>

            {notice ? <p className="wordle-notice">{notice}</p> : null}

            <WordleKeyboard
              guesses={guesses}
              disabled={inputDisabled}
              onKeyPress={handleVirtualKey}
            />
          </div>
        ) : null}

        {/* ── Locked state (already played today) ── */}
        {locked ? (
          <div className="wordle-locked-card">
            <h3>You already played today.</h3>
            <p>Come back tomorrow for a fresh word and another chance to earn points.</p>
            <p>Next play available: {getNextWordleAvailableLabel()}</p>
          </div>
        ) : null}
      </div>

      {/* ── Help overlay ── rendered here, OUTSIDE .wordle-modal, so it
           sits as a sibling inside the fixed backdrop and covers the full
           viewport regardless of modal scroll position. ── */}
      {showHelp ? <WordleHelpOverlay onClose={() => setShowHelp(false)} /> : null}
    </div>
  );
}

export default WordleGameModal;
