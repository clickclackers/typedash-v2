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
  user_id: number;
  single_total_races: number;
  single_total_time: number;
  single_avg_wpm: number;
  multi_total_races: number;
  multi_total_time: number;
  multi_avg_wpm: number;
}
