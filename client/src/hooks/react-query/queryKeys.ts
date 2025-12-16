const queryKeys = {
  userOverviewStats: ['user-overview-stats'],
  singleplayerResults: ['singleplayer-results'],
  challengesByCategory: ({ category }: { category: string }) => [
    'challenges-by-category',
    category,
  ],
};

export default queryKeys;
