export interface User {
  id: number;
  username: string;
  email: string;
}

// API request types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// API response types
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface StatisticsResponse {
  single_total_races: number;
  single_total_time: number;
  single_avg_wpm: number;
  multi_total_races: number;
  multi_total_time: number;
  multi_avg_wpm: number;
}

export interface ResultsRequest {
  challenge_id: number;
  wpm: number;
  accuracy: number;
  time_taken: number;
  created_at: string;
}

export interface ChallengesResponse {
  challenges: Challenge[];
}

export interface Challenge {
  id: number;
  title: string;
  category: string;
  author: string;
  text: string;
  name: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
}
