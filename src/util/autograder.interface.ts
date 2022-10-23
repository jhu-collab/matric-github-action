export interface AutograderData {
  //What an autograder returns
  score: number; // optional, but required if not on each test case below. Overrides total of tests if specified.
  execution_time: number; // optional, seconds
  output: string; // optional
  visibility: Visibility; // Optional visibility setting
  stdout_visibility: Visibility; // Optional stdout visibility setting
  extra_data: any; // Optional extra data to be stored
  tests: Test[]; // Optional, but required if no top-level score
  leaderboard: LeaderBoardStatus[]; // Optional, will set up leaderboards for these values
}

type Visibility = 'hidden' | 'after_due_date' | 'after_published' | 'visible';

interface Test {
  score: number; // optional, but required if not on top level submission
  max_score: number; // optional
  status: 'passed' | 'failed'; // optional
  name: string; // optional
  number: number; // optional (will just be numbered in order of array if no number given)
  output: string; // optional
  filePath: string; // optional
  lineNumber: number; //optional to associate to a specific line
  tags: string[]; // optional
  visibility: Visibility; // Optional visibility setting
  extra_data: any; // Optional extra data to be stored
}

interface LeaderBoardStatus {
  name: string;
  value: string | number;
  order: 'asc' | 'dsc';
}

export {};
