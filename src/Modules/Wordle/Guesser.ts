import wordList from './wordlist';

type GuessersGroup = {
	[key: number]: {
		guesser: Guesser;
		word: string;
	};
};

type NormalizedLetterMap = {
	[key: string]: string;
};

type WordInstance = {
	hasLetter: (letter: string) => boolean;
	hasLetterInIndex: (letter: string, index: number) => boolean;
	stringRepresentation: string;
};

const createWordInstance = (word: string): WordInstance => {
	return {
		stringRepresentation: word,
		hasLetter: (letter: string) => word.includes(letter),
		hasLetterInIndex: (letter: string, index: number) => word[index] === letter,
	};
};

export enum LetterStatus {
	LetterInIndex,
	LetterInWord,
	LetterNotFound,
}

class Guesser {
	tries: number;
	history: LetterStatus[][];
	instance?: Guesser;
	id: number;
	word: WordInstance;
	won: boolean;

	constructor(id: number) {
		this.id = id;
		this.tries = 0;
		this.word = createWordInstance(this.getWord(id));
		this.history = [];
		this.won = false;
	}

	static guessersGroup: GuessersGroup = {};

	static getInstance(phone: number) {
		//that's a factory and singleton in the same function
		//kinda ugly but whatever, it's functional
		const now = new Date();
		const today = now.getMonth() * 31 + now.getDate();
		const id = phone ^ today;
		const guesser = new Guesser(id);
		const word = guesser.word.stringRepresentation;

		if (!this.guessersGroup[id]) this.guessersGroup[id] = { word, guesser };

		return this.guessersGroup[id];
	}

	getWord(id: number) {
		return wordList[id % wordList.length];
	}

	guess(guess: string) {
		if (this.won)
			throw 'Você já adivinhou essa palavra. Volte amanhã para jogar mais';
		if (this.tries === 6) throw 'Chances encerradas';
		const result = guess.split('').map((letter, index) => {
			const normalizedLetter = this.normalizeLetter(letter.toLowerCase());
			if (this.word.hasLetterInIndex(normalizedLetter, index))
				return LetterStatus.LetterInIndex;
			if (this.word.hasLetter(normalizedLetter)) return LetterStatus.LetterInWord;
			return LetterStatus.LetterNotFound;
		});

		this.won =
			result.filter(letter => letter === LetterStatus.LetterInIndex).length ===
			this.word.stringRepresentation.length;

		this.history.push(result);
		this.tries++;
		return result;
	}

	/**
	 * I'm having trouble using string.normalize on node environment. Better
	 * to just create my own normalizing function
	 * @param letter
	 */
	normalizeLetter(letter: keyof NormalizedLetterMap) {
		const normalizedLetterMap: NormalizedLetterMap = {
			['à']: 'a',
			['á']: 'a',
			['ã']: 'a',
			['â']: 'a',
			['é']: 'e',
			['è']: 'e',
			['í']: 'i',
			['ì']: 'i',
			['õ']: 'o',
			['ô']: 'o',
			['ò']: 'o',
			['ó']: 'o',
			['û']: 'u',
			['ú']: 'u',
			['ç']: 'c',
		};

		return normalizedLetterMap[letter] || (letter as string);
	}
}

export default Guesser;
