/**
 * History Service
 * 
 * This service manages raffle histories for different raffle types in a unified way.
 * It stores all histories in a single JSON file in the public directory.
 */

// Define the different types of raffle histories
export interface RegularRaffleHistory {
  id: string;
  date: string;
  items: string[];
  winnerCount: number;
  winners: string[];
}

export interface TeamMatchingRaffleHistory {
  id: string;
  date: string;
  teams: string[];
  candidates: string[];
  results: { team: string; candidate: string | null }[];
}

// Define the structure of our unified history storage
export interface RaffleHistories {
  regular: RegularRaffleHistory[];
  teamMatching: TeamMatchingRaffleHistory[];
}

// File path for JSON storage
const STORAGE_FILE = '/raffle-histories.json';

// Initialize empty histories
const defaultHistories: RaffleHistories = {
  regular: [],
  teamMatching: []
};

/**
 * Get all raffle histories
 */
export async function getAllHistories(): Promise<RaffleHistories> {
  try {
    const response = await fetch(STORAGE_FILE);
    if (!response.ok) return defaultHistories;
    
    return await response.json() as RaffleHistories;
  } catch (error) {
    console.error('Error loading raffle histories:', error);
    return defaultHistories;
  }
}

/**
 * Save all raffle histories
 */
export async function saveAllHistories(histories: RaffleHistories): Promise<void> {
  try {
    const response = await fetch('/api/save-histories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(histories)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save histories');
    }
  } catch (error) {
    console.error('Error saving raffle histories:', error);
  }
}

/**
 * Get regular raffle histories
 */
export async function getRegularHistories(): Promise<RegularRaffleHistory[]> {
  const histories = await getAllHistories();
  return histories.regular;
}

/**
 * Save a new regular raffle history
 */
export async function saveRegularHistory(history: RegularRaffleHistory): Promise<void> {
  const allHistories = await getAllHistories();
  allHistories.regular = [history, ...allHistories.regular];
  await saveAllHistories(allHistories);
}

/**
 * Get team matching raffle histories
 */
export async function getTeamMatchingHistories(): Promise<TeamMatchingRaffleHistory[]> {
  const histories = await getAllHistories();
  return histories.teamMatching;
}

/**
 * Save a new team matching raffle history
 */
export async function saveTeamMatchingHistory(history: TeamMatchingRaffleHistory): Promise<void> {
  const allHistories = await getAllHistories();
  allHistories.teamMatching = [history, ...allHistories.teamMatching];
  await saveAllHistories(allHistories);
}

/**
 * Migrate existing histories from old localStorage keys
 */
export async function migrateExistingHistories(): Promise<void> {
  try {
    const allHistories = await getAllHistories();
    let didMigrate = false;
    
    // Migrate regular raffle histories
    const regularStoredHistory = localStorage.getItem('regularRaffleHistory');
    if (regularStoredHistory) {
      const regularHistories = JSON.parse(regularStoredHistory) as RegularRaffleHistory[];
      if (regularHistories.length > 0) {
        allHistories.regular = [...regularHistories, ...allHistories.regular];
        didMigrate = true;
      }
    }
    
    // Migrate team matching histories
    const teamStoredHistory = localStorage.getItem('raffleHistory');
    if (teamStoredHistory) {
      const teamHistories = JSON.parse(teamStoredHistory) as TeamMatchingRaffleHistory[];
      if (teamHistories.length > 0) {
        allHistories.teamMatching = [...teamHistories, ...allHistories.teamMatching];
        didMigrate = true;
      }
    }
    
    // Save migrated histories if any were found
    if (didMigrate) {
      await saveAllHistories(allHistories);
      console.log('Successfully migrated existing raffle histories');
      
      // Clear old storage keys after migration
      localStorage.removeItem('regularRaffleHistory');
      localStorage.removeItem('raffleHistory');
    }
  } catch (error) {
    console.error('Error migrating raffle histories:', error);
  }
}