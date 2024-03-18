import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import OneHotEncoder
import csv
import datetime
import sys
ab= DecisionTreeClassifier()
def record(date, mood):
    with open('mood_data.csv', 'a', newline='') as csvfile:
        fieldnames = ['Date', 'Mood']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writerow({'Date': date, 'Mood': mood})
        
user = {
    'Weekday': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    'Time': ['Morning', 'Morning', 'Afternoon', 'Evening', 'Evening'],
    'Mood': ['Excited', 'Stressed', 'Happy', 'Down', 'Motivated'],
    'Activities': ['Workout', 'Meeting', 'Hangout', 'Rest', 'Study']
}

df=pd.DataFrame(user)
day = sys.argv[1]
time = sys.argv[2]
submood = sys.argv[3]
activity = sys.argv[4]
date = datetime.date.today().strftime('%Y-%m-%d')
user_input = pd.DataFrame({
                           'Weekday': [day],
                           'Time': [time],
                           'Mood': [submood],
                           'Activities': [activity]})
encoder = OneHotEncoder()
encoder.fit(df[['Weekday', 'Time', 'Mood', 'Activities']])
user_input_encoded = encoder.transform(user_input).toarray()
X = encoder.transform(user_input[['Weekday', 'Time', 'Mood', 'Activities']])
y = user_input['Mood']
ab.fit(X, y)
predicted_mood = ab.predict(user_input_encoded)[0]
print("Predicted mood:", predicted_mood)
record(date, predicted_mood)
print("Mood recorded successfully.")