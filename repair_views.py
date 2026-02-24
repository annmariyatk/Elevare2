
import os

bak_path = 'backend/students/views.py.bak'
out_path = 'backend/students/views.py'

if not os.path.exists(bak_path):
    print(f"Error: {bak_path} not found")
    exit(1)

with open(bak_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Part 1: Start to end of first block (line 1792)
# Part 2: Unique functions at the end (line 3550 onwards)
new_lines = lines[:1792] + ["\n\n# --- RESTORED UNIQUE FUNCTIONS ---\n\n"] + lines[3549:]

with open(out_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Successfully repaired {out_path}. Total lines: {len(new_lines)}")
