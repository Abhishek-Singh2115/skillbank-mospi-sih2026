import re

with open('index.html', encoding='utf-8') as f:
    text = f.read()

script_match = re.search(r'<script type="text/babel">([\s\S]*?)</script>', text)
code = script_match.group(1)

lines = code.split('\n')
clean_lines = []
in_block = False
for l in lines:
    clean = ''
    i = 0
    while i < len(l):
        if not in_block and l[i:i+2] == '/*':
            in_block = True
            i += 2
            continue
        elif in_block and l[i:i+2] == '*/':
            in_block = False
            i += 2
            continue
        elif not in_block and l[i:i+2] == '//':
            break
        elif not in_block:
            clean += l[i]
        i += 1
    clean_lines.append(clean)

stack = []
pairs = {')': '(', ']': '[', '}': '{'}
in_str = None
escape = False
for line_no, line in enumerate(clean_lines, 1):
    for col_no, ch in enumerate(line, 1):
        if escape:
            escape = False
            continue
        if ch == '\\':
            escape = True
            continue
        if in_str:
            if ch == in_str:
                in_str = None
            continue
        if ch in ('"', "'", '`'):
            in_str = ch
            continue
        if ch in '({[':
            stack.append((ch, line_no, col_no, line[:col_no]))
        elif ch in ')}]':
            if stack:
                top, l, c, pre = stack.pop()
                if top != pairs[ch]:
                    print(f"Mismatched {top} at line {l} with {ch} at line {line_no}")

print("Remaining unclosed openers:", len(stack))
for s in stack:
    print(s[0], "at line", s[1], ":", s[3].strip()[-50:])
