import { Card, CardGroup, DECKS } from "./cards";
import { Hand, Renderer, Table, TokenArea } from "./display";


class UnicodeCardRenderer implements Renderer<Card, CardGroup> {
    renderTable(table: Table): void {
        
    }

    renderHand(hand: Hand): void {
        
    }

    renderToken(area: TokenArea, token: Card): void {
        
    }

    renderTokenGroup(area: TokenArea, group: CardGroup): void {
        
    }
}



console.log(DECKS.std52().tokens.map(card => card.toString()));