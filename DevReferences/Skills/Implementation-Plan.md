# Implementation Plan Documentation Skill

## Purpose

This skill defines how AI agents must name, number, and store implementation plan documents within the project.

## Storage Location

All implementation plan documents MUST be stored in:

`DevReferences/implementation-plan/`

## File Naming Convention

Use the following naming format:

`NNN - Descriptive Implementation Plan Title.md`

Rules:

1. Use a sequential three-digit number (`001`, `002`, `003`, etc.).
2. Before creating a new file, inspect the target directory and identify the highest existing file number.
3. Assign the next sequential number based on the highest existing number.
4. Write a concise, descriptive title consisting of approximately 2–5 words that clearly represents the feature or implementation scope.
5. Always use the `.md` extension.
6. Preserve all existing filenames. Never overwrite or rename previous implementation plans unless explicitly requested.

## Workflow

1. Check whether `DevReferences/implementation-plan/` exists.
2. If it does not exist, create the directory.
3. Inspect existing files and determine the highest numerical prefix.
4. Generate the next sequential number.
5. Create the implementation plan using the naming convention.
6. Save the document in the designated directory.

## Examples

If the directory is empty:

- `001 - Migrate Local Upload to Supabase Storage.md`

If the directory already contains:

- `001 - Migrate Local Upload to Supabase Storage.md`
- `002 - Update Database Schema.md`

The next document MUST be:

- `003 - Implement User Authentication.md`

## Important Constraints

- Never assume the next number without inspecting the directory.
- Never restart numbering when previous implementation plans exist.
- Never save implementation plans outside the designated directory unless explicitly requested.
- Always use Markdown (`.md`) format.
- If multiple agents or processes may create plans simultaneously, check for filename conflicts before saving and select the next available number.
