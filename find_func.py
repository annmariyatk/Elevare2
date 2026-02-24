
import re

file_path = 'backend/students/views.py'
with open(file_path, 'r', encoding='utf-8') as file:
    lines = file.readlines()

for i, line in enumerate(lines):
    if 'def update_study_enddate' in line:
        print(f"Found at line {i+1}: {line.strip()}")
