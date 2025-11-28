import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password is too long");

export const todoTextSchema = z
  .string()
  .trim()
  .min(1, "Task cannot be empty")
  .max(300, "Task is too long");

export const subjectNameSchema = z
  .string()
  .trim()
  .min(1, "Subject name cannot be empty")
  .max(80, "Subject name is too long");

export const chapterNameSchema = z
  .string()
  .trim()
  .min(1, "Chapter name cannot be empty")
  .max(120, "Chapter name is too long");

export const focusMinutesSchema = z
  .number()
  .int("Must be a whole number")
  .min(1, "At least 1 minute")
  .max(600, "Maximum 600 minutes");
