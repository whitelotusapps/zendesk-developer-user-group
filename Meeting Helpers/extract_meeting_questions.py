'''
This code is to help the Zendesk Developer User Group Leader, extract questions that are contained in chat CSV
that is exported and provided to me by Zendesk.
'''

import os
import pandas as pd
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize

os.system('clear')

meeting_date = input("Enter in the meeting date: ")

CSV_PATH = f'{meeting_date}/Chat/event_chat.csv'

# Load the CSV data into a DataFrame
df = pd.read_csv(CSV_PATH)

# Convert Timestamp to datetime and sort the DataFrame
df['Timestamp'] = pd.to_datetime(df['Timestamp'])
df.sort_values(by='Timestamp', inplace=True)

# Define a function that checks if a sentence is a question
def is_question(sentence):
    # A simple heuristic: if it ends with a question mark, it's a question
    return sentence.endswith('?')

# Initialize a counter for the questions
question_count = 0 

# Go through all the rows in the DataFrame
for index, row in df.iterrows():
    # Tokenize the cell into sentences
    sentences = sent_tokenize(row['Text'])
    
    # Check each sentence to see if it's a question
    questions = [sentence for sentence in sentences if is_question(sentence)]

    # Add the number of questions to the count
    question_count += len(questions)

    # Print the questions along with the person's name who asked it
    for question in questions:
        print(f'Question: {question}\nAsked by: {row["First name"]} {row["Last name"]}\n')

# Print the total number of questions at the end
print(f'Total number of questions: {question_count}')