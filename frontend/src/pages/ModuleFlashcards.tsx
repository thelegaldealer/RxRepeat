import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, ArrowRight, RotateCw, Star, PlayCircle, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from '@/components/ui/card';

export default function ModuleFlashcards() {
  const { nodeId } = useParams();
  const [decks, setDecks] = useState<any[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('all'); // 'all' or 'needs_work'

  useEffect(() => {
    api.get(`/flashcard-sets/?node__tab=${nodeId}`)
       .then(res => {
          setDecks(res.data);
          if (res.data.length > 0) {
            setActiveDeckId(res.data[0].id.toString());
            setCards(res.data[0].cards || []);
          }
       })
       .catch(err => console.error('Failed to load decks'))
       .finally(() => setLoading(false));
  }, [nodeId]);

  useEffect(() => {
    if (activeDeckId) {
      const deck = decks.find(d => d.id.toString() === activeDeckId);
      if (deck) {
        setCards(deck.cards || []);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    }
  }, [activeDeckId, decks]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCard = cards[currentIndex];

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleOutcome = (isCorrect: boolean) => {
    if (activeCard) {
      api.post('/flashcard-progress/', { card: activeCard.id, is_correct: isCorrect })
         .catch(err => console.error('Failed to patch progress', err));
    }
    nextCard();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Button variant="ghost" size="icon" asChild className="h-6 w-6 mr-1">
              <Link to={`/dashboard`}>
                 <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span>Node {nodeId}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Flashcards</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Flashcard Review</h2>
        </div>

        <div className="flex items-center space-x-3">
           <Select value={activeDeckId} onValueChange={setActiveDeckId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map(deck => (
                <SelectItem key={deck.id} value={deck.id.toString()}>{deck.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-[150px]">
              <Settings2 className="h-4 w-4 mr-2 text-muted-foreground"/>
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Test All</SelectItem>
              <SelectItem value="needs_work">Needs Work</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {decks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed">
          <RotateCw className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold">No Decks Available</h3>
          <p className="text-muted-foreground mt-1">
            Your instructor hasn't created any flashcards for this module yet.
          </p>
        </Card>
      ) : cards.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed">
          <h3 className="text-lg font-semibold">Deck is Empty</h3>
          <p className="text-muted-foreground mt-1">
            {mode === 'needs_work' ? 'You have mastered all cards in this deck!' : 'This deck currently contains no cards.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col items-center space-y-8 mt-8">
          <div className="flex items-center justify-between w-full max-w-3xl px-4">
            <span className="text-sm font-medium text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <Button variant="ghost" size="icon">
              <Star className="h-5 w-5 text-muted-foreground hover:text-yellow-500 transition-colors" />
            </Button>
          </div>

          {/* The Flashcard Flip Container */}
          <div 
            className="w-full max-w-3xl aspect-video perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
              {/* Front side */}
              <Card className="absolute w-full h-full backface-hidden flex items-center justify-center p-8 lg:p-12 text-center bg-card shadow-lg hover:shadow-xl transition-shadow">
                <p className="text-2xl lg:text-4xl font-semibold leading-relaxed">
                  {activeCard?.front}
                </p>
                <span className="absolute bottom-4 right-6 text-xs text-muted-foreground flex items-center">
                  Click to flip <RotateCw className="h-3 w-3 ml-2" />
                </span>
              </Card>

              {/* Back side */}
              <Card className="absolute w-full h-full backface-hidden rotate-x-180 flex items-center justify-center p-8 lg:p-12 text-center bg-primary/5 border-primary/20 shadow-lg">
                <p className="text-xl lg:text-3xl leading-relaxed text-foreground">
                  {activeCard?.back}
                </p>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col space-y-4 w-full max-w-3xl">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="lg" onClick={prevCard} disabled={currentIndex === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>

              <div className="hidden sm:flex space-x-2">
                 <Button variant="secondary" size="lg" onClick={() => handleOutcome(false)} disabled={!isFlipped}>
                   Needs Work (Fail)
                 </Button>
                 <Button variant="default" size="lg" onClick={() => handleOutcome(true)} disabled={!isFlipped} className="bg-green-600 hover:bg-green-700">
                   Got It (Pass)
                 </Button>
              </div>

              <Button variant="outline" size="lg" onClick={nextCard} disabled={currentIndex === cards.length - 1}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            {/* Mobile action buttons */}
            <div className="flex sm:hidden space-x-2 w-full">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => handleOutcome(false)} disabled={!isFlipped}>
                Fail
              </Button>
              <Button variant="default" size="lg" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleOutcome(true)} disabled={!isFlipped}>
                Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
