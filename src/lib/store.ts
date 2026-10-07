'use client';

import { useState, useEffect } from 'react';
import { Creator, SocialAccount, Post, BrandDeal, BrandDirectoryItem } from './types';
import { MOCK_CREATORS, MOCK_SOCIAL_ACCOUNTS, MOCK_POSTS, MOCK_BRAND_DEALS, MOCK_BRAND_DIRECTORY } from './mock-data';

const STORAGE_KEY_CREATOR = 'creatorpulse_active_creator_id';
const STORAGE_KEY_DEALS = 'creatorpulse_deals';
const STORAGE_KEY_CURRENCY = 'creatorpulse_currency';
const STORAGE_KEY_POSTS = 'creatorpulse_posts';

export function useCreatorStore() {
  const [activeCreatorId, setActiveCreatorId] = useState<string>('creator-ananya');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [deals, setDeals] = useState<BrandDeal[]>(MOCK_BRAND_DEALS);
  const [postsMap, setPostsMap] = useState<Record<string, Post[]>>(MOCK_POSTS);
  const [lastSyncedText, setLastSyncedText] = useState<string>('Synced 12 min ago');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCreator = localStorage.getItem(STORAGE_KEY_CREATOR);
      const savedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY) as 'USD' | 'INR' | null;
      const savedDeals = localStorage.getItem(STORAGE_KEY_DEALS);
      const savedPosts = localStorage.getItem(STORAGE_KEY_POSTS);

      if (savedCreator && MOCK_CREATORS.some((c) => c.id === savedCreator)) {
        setActiveCreatorId(savedCreator);
      }
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
      if (savedDeals) {
        try {
          setDeals(JSON.parse(savedDeals));
        } catch (e) {
          console.error(e);
        }
      }
      if (savedPosts) {
        try {
          setPostsMap(JSON.parse(savedPosts));
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const switchCreator = (id: string) => {
    setActiveCreatorId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CREATOR, id);
    }
  };

  const toggleCurrency = (newCurrency: 'USD' | 'INR') => {
    setCurrency(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency);
    }
  };

  const currentCreator: Creator =
    MOCK_CREATORS.find((c) => c.id === activeCreatorId) || MOCK_CREATORS[0];

  const currentAccounts: SocialAccount[] =
    MOCK_SOCIAL_ACCOUNTS[activeCreatorId] || [];

  const primaryAccount =
    currentAccounts.find((a) => a.platform === 'instagram') ||
    currentAccounts[0] || {
      id: 'default',
      creator_id: currentCreator.id,
      platform: 'instagram' as const,
      handle: '@' + currentCreator.full_name.toLowerCase().replace(/\s+/g, ''),
      follower_count: 25000,
      avg_engagement_rate: 2.2,
      last_synced_at: 'just now',
      connected: true,
    };

  const currentPosts: Post[] = postsMap[activeCreatorId] || [];

  const addDeal = (deal: Omit<BrandDeal, 'id' | 'created_at'>) => {
    const newDeal: BrandDeal = {
      ...deal,
      id: `deal-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newDeal, ...deals];
    setDeals(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(updated));
    }
    return newDeal;
  };

  const updateDealStage = (dealId: string, newStage: BrandDeal['stage']) => {
    const updated = deals.map((d) => {
      if (d.id === dealId) {
        const isWonOrPaid = newStage === 'won' || newStage === 'paid';
        return {
          ...d,
          stage: newStage,
          status: isWonOrPaid ? ('accepted' as const) : newStage === 'lost' ? ('declined' as const) : ('pitching' as const),
        };
      }
      return d;
    });
    setDeals(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(updated));
    }
  };

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedText('Synced just now');
    }, 1200);
  };

  const formatCurrency = (amount: number): string => {
    if (currency === 'INR') {
      return `₹${(amount * 84).toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return {
    isLoaded,
    activeCreatorId,
    currentCreator,
    currentAccounts,
    primaryAccount,
    currentPosts,
    deals,
    currency,
    lastSyncedText,
    isSyncing,
    switchCreator,
    toggleCurrency,
    addDeal,
    updateDealStage,
    triggerManualSync,
    formatCurrency,
    brandDirectory: MOCK_BRAND_DIRECTORY,
  };
}
