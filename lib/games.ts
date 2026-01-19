import { FaComments, FaHandRock, FaExchangeAlt, FaQuestionCircle, FaListUl, FaGlasses, FaRandom, FaSortAlphaDown, FaLink, FaBrain, FaTheaterMasks, FaPencilAlt } from "react-icons/fa";

export type GameConfig = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  buttonText?: string;
  dataKey?: string; 
  mode: 'generator' | 'taboo' | 'rules'; 
  rulesText?: string[];
};

export const GAMES: GameConfig[] = [
  {
    id: "taboo",
    name: "Taboo",
    description: "Describe the word—but don't say the forbidden words!",
    icon: FaComments,
    color: "bg-rose-500",
    mode: "taboo",
    dataKey: "taboo"
  },
  {
    id: "charades",
    name: "Charades",
    description: "Act it out—no talking allowed!",
    icon: FaTheaterMasks,
    color: "bg-fuchsia-500",
    buttonText: "Next Prompt",
    dataKey: "charades",
    mode: "generator"
  },
  {
    id: "pictionary",
    name: "Pictionary",
    description: "Draw it out—no words or gestures!",
    icon: FaPencilAlt,
    color: "bg-cyan-500",
    buttonText: "Next Word",
    dataKey: "pictionary",
    mode: "generator"
  },
  {
    id: "riddles",
    name: "Riddles",
    description: "Classic brain teasers for the whole family",
    icon: FaQuestionCircle,
    color: "bg-emerald-500",
    buttonText: "Next Riddle",
    dataKey: "riddles",
    mode: "generator"
  },
  {
    id: "lateral",
    name: "Lateral Thinking",
    description: "Weird scenarios that need creative solutions",
    icon: FaBrain,
    color: "bg-violet-500",
    buttonText: "Next Puzzle",
    dataKey: "lateral",
    mode: "generator"
  },
  {
    id: "ice-breaker",
    name: "Ice Breakers",
    description: "Fun questions to get everyone talking",
    icon: FaRandom,
    color: "bg-sky-500",
    buttonText: "Next Question",
    dataKey: "icebreaker",
    mode: "generator"
  },
  {
    id: "fortunately-unfortunately",
    name: "Fortunately / Unfortunately",
    description: "Alternate telling a wild story!",
    icon: FaExchangeAlt,
    color: "bg-lime-500",
    mode: "rules",
    rulesText: [
      "Someone starts a story: 'Once upon a time, a man went for a walk.'",
      "Next person starts with 'Fortunately...' and adds something good.",
      "Next person starts with 'Unfortunately...' and adds something bad.",
      "Keep alternating! The story gets wild fast.",
      "Example: 'Fortunately, he found $100!' → 'Unfortunately, a bird stole it!'"
    ]
  },
  {
    id: "only-questions",
    name: "Only Questions",
    description: "Everything must be a question!",
    icon: FaQuestionCircle,
    color: "bg-pink-500",
    mode: "rules",
    rulesText: [
      "Have a conversation, but you can ONLY ask questions.",
      "Statements are not allowed! Only questions.",
      "If you make a statement or hesitate too long, you're out!",
      "Keep the conversation going as long as possible.",
      "Example: 'How are you?' → 'Why do you ask?' → 'Can't I be curious?'"
    ]
  },
  {
    id: "convergence",
    name: "Convergence",
    description: "Keep guessing until you say the same word!",
    icon: FaExchangeAlt,
    color: "bg-purple-500",
    mode: "rules",
    rulesText: [
      "Two players face each other.",
      "Count to 3, then both say any word.",
      "Now find a word that connects those two words.",
      "Count to 3 again—try to say the SAME connecting word!",
      "Keep going until you both say the exact same thing.",
      "Example: 'Banana' + 'Monkey' → both say 'Jungle'!"
    ]
  },
  {
    id: "this-beats-that",
    name: "This Beats That",
    description: "Rock-paper-scissors but with anything!",
    icon: FaHandRock,
    color: "bg-orange-500",
    mode: "rules",
    rulesText: [
      "Someone names a thing: 'A Tank'",
      "Next person names what beats it: 'Rust'",
      "Next person beats that: 'Sandpaper'",
      "Keep going until someone can't think of anything!"
    ]
  },
  {
    id: "neanderthal",
    name: "Neanderthal",
    description: "Explain big words using only small words",
    icon: FaComments,
    color: "bg-amber-500",
    buttonText: "New Word",
    dataKey: "contact", 
    mode: "generator"
  },
  {
    id: "contact",
    name: "Contact",
    description: "One person picks a secret word, others guess!",
    icon: FaGlasses,
    color: "bg-blue-500",
    buttonText: "New Secret Word",
    dataKey: "contact",
    mode: "generator"
  },
  {
    id: "word-chain",
    name: "Word Chain",
    description: "Name things in the category—no repeats!",
    icon: FaListUl,
    color: "bg-lime-500",
    buttonText: "New Category",
    dataKey: "categories",
    mode: "generator"
  },
  {
    id: "alphabet",
    name: "ABC Conversation",
    description: "Chat where each sentence starts with the next letter",
    icon: FaSortAlphaDown,
    color: "bg-indigo-500",
    mode: "rules",
    rulesText: [
      "Have a conversation with one rule:",
      "First person's sentence starts with A",
      "Next person's starts with B",
      "Then C, D, E... all the way to Z!",
      "Hesitate too long? You're out!"
    ]
  },
  {
    id: "chain",
    name: "Last Word",
    description: "Start your sentence with their last word",
    icon: FaLink,
    color: "bg-cyan-500",
    mode: "rules",
    rulesText: [
      "Someone says a sentence.",
      "You must start YOUR sentence with THEIR last word.",
      "'I love going to the park.'",
      "'Park benches are uncomfortable.'",
      "'Uncomfortable? I think they're fine!'",
      "Keep going—don't break the chain!"
    ]
  }
];

export const getGame = (slug: string) => GAMES.find(g => g.id === slug);