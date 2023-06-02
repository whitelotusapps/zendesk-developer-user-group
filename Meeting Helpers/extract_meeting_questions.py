'''
This code is to help the Zendesk Developer User Group Leader, extract questions that are contained in chat CSV
that is exported and provided to me by Zendesk.
'''

import os
import pandas as pd
import nltk
import pytz
from nltk.tokenize import sent_tokenize, word_tokenize

os.system('clear')

meeting_date = input("Enter in the meeting date: ")

CSV_PATH = f'{meeting_date}/Chat/event_chat.csv'

# Load the CSV data into a DataFrame
df = pd.read_csv(CSV_PATH)

# Convert Timestamp to datetime and sort the DataFrame
df['Timestamp'] = pd.to_datetime(df['Timestamp'])

# Convert Timestamp to datetime, localize to UTC and then convert to CDT
df['Timestamp'] = pd.to_datetime(df['Timestamp']).dt.tz_localize('UTC').dt.tz_convert('America/Chicago')

df.sort_values(by='Timestamp', inplace=True)

# Define a function that checks if a sentence is a question
def is_question(sentence):
    # A simple heuristic: if it ends with a question mark, it's a question
    return sentence.endswith('?')

# Initialize a dictionary for the questions
questions_by_person = {}

# Go through all the rows in the DataFrame
for index, row in df.iterrows():
    # Tokenize the cell into sentences
    sentences = sent_tokenize(row['Text'])
    
    # Check each sentence to see if it's a question
    questions = [sentence for sentence in sentences if is_question(sentence)]

    # Add the questions to the correct person's list in the dictionary
    name = f'{row["First name"]} {row["Last name"]}'
    if name not in questions_by_person:
        questions_by_person[name] = []
    for question in questions:
        time = row['Timestamp'].strftime('%H:%M')
        questions_by_person[name].append((time, question))

# Print the questions along with the person's name who asked it
total_questions = 0
for name, questions in questions_by_person.items():
    if len(questions) > 0:
        print(f'{name} asked:')
        for time, question in questions:
            print(f'\t[{time}] {question}')
        print(f'\nTotal questions asked by {name}: {len(questions)}\n')
        total_questions += len(questions)

# Print the total number of questions at the end
print(f'Total number of questions: {total_questions}')
