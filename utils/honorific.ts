/**
 * Utility functions for respectful addressing based on gender
 */

export const getHonorific = (gender: 'male' | 'female'): string => {
  return gender === 'male' ? 'Prabhuji' : 'Mataji';
};

export const getGreeting = (userName: string, gender: 'male' | 'female'): string => {
  const honorific = getHonorific(gender);
  return `${userName} ${honorific}`;
};
