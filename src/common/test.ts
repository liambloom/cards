import { Card, DECKS } from "./cards";
import { combinationTokenGroup } from "./token";


console.log(DECKS.std52().tokens.map(card => card.toString()));