# Google Sheets Integration Setup

This guide will help you set up Google Sheets as your database for the careers website.

## Step 1: Create a Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename it to "Careers Website Database"
4. Copy the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

## Step 2: Set up Google Sheets Structure

Create two sheets in your Google Sheets document:

### Jobs Sheet
Create a sheet named "Jobs" with these headers in row 1:
- A1: `ID`
- B1: `Title`
- C1: `Department`
- D1: `Type`
- E1: `Level`
- F1: `Location`
- G1: `Description`
- H1: `Requirements`
- I1: `ApplicationURL`
- J1: `IsActive`
- K1: `CreatedAt`
- L1: `UpdatedAt`

### Applications Sheet
Create a sheet named "Applications" with these headers in row 1:
- A1: `ID`
- B1: `JobID`
- C1: `FirstName`
- D1: `LastName`
- E1: `Email`
- F1: `Phone`
- G1: `ResumeURL`
- H1: `CoverLetter`
- I1: `Status`
- J1: `Notes`
- K1: `AppliedAt`
- L1: `UpdatedAt`

## Step 3: Set up Google API Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Click "Create and Continue"
   - Skip role assignment for now
   - Click "Done"

5. Create a key for the service account:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the JSON file

## Step 4: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add these environment variables:
```
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
```

3. Upload your Google service account credentials JSON file to your project
4. Update the `GOOGLE_APPLICATION_CREDENTIALS` path to point to your JSON file

## Step 5: Share the Google Sheet

1. Open your Google Sheets document
2. Click the "Share" button
3. Add the service account email (found in your JSON credentials file) as an editor
4. Make sure the service account has edit permissions

## Step 6: Test the Integration

Your careers website should now be connected to Google Sheets. When you:
- View the careers page, it will read job data from the "Jobs" sheet
- Submit applications, they will be stored in the "Applications" sheet
- Add/edit jobs through the admin panel, changes will be reflected in Google Sheets

## Benefits of Google Sheets Integration

- **Easy Data Management**: Edit job postings directly in Google Sheets
- **Real-time Updates**: Changes in Google Sheets appear immediately on your website
- **Collaboration**: Multiple team members can manage job data
- **No Database Hosting**: No need to manage a separate database server
- **Built-in Backup**: Google Sheets automatically saves and versions your data
- **Analytics**: Use Google Sheets functions to analyze application data

## Sample Data Format

Here's how your data might look in Google Sheets:

### Jobs Sheet Sample:
| ID | Title | Department | Type | Level | Location | Description | Requirements | ApplicationURL | IsActive | CreatedAt | UpdatedAt |
|----|--------|------------|------|-------|----------|-------------|--------------|----------------|----------|-----------|-----------|
| job1 | Frontend Developer | Engineering | Full-time | Senior | Remote | Build web apps | ["React", "TypeScript"] | https://forms.google.com/... | TRUE | 2024-01-01T00:00:00Z | 2024-01-01T00:00:00Z |

### Applications Sheet Sample:
| ID | JobID | FirstName | LastName | Email | Phone | ResumeURL | CoverLetter | Status | Notes | AppliedAt | UpdatedAt |
|----|-------|-----------|----------|--------|-------|-----------|-------------|--------|-------|-----------|-----------|
| app1 | job1 | John | Doe | john@email.com | 555-0123 | resume.pdf | I'm interested... | pending | | 2024-01-01T00:00:00Z | 2024-01-01T00:00:00Z |