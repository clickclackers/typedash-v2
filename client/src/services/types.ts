// API Response Types
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
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

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
}
