import { z } from 'zod';

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
  location: z.string().optional()
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
