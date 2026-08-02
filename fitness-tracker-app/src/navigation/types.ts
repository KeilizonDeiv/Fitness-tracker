export type RootStackParamList = {
  Tabs: undefined;
  WorkoutForm: { workoutId?: string } | undefined;
  WorkoutDetail: { workoutId: string };
  GoalForm: { goalId?: string } | undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Metrics: undefined;
  Water: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
