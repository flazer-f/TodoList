export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Complete' | 'Incomplete';
}

export interface User {
  id: string;
  username: string;
  email: string;
}
