const queryKeys = {
  userOverviewStats: ['user-overview-stats'],
  singleplayerResults: ['singleplayer-results'],
  challengesByCategory: ({ categoryId }: { categoryId: number }) => [
    'challenges-by-category',
    categoryId,
  ],
  categories: ['categories'],
};

export default queryKeys;
