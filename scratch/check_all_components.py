import re

with open('index.html', encoding='utf-8') as f:
    text = f.read()

funcs = list(re.finditer(r'\n    function ([A-Za-z0-9_]+)\s*\(', text))
lines = text.split("\n")

for i, m in enumerate(funcs):
    func_name = m.group(1)
    start_pos = m.start()
    start_line = text[:start_pos].count("\n") + 1
    
    if i + 1 < len(funcs):
        next_pos = funcs[i+1].start()
        end_line = text[:next_pos].count("\n")
    else:
        end_line = len(lines)
        
    comp_lines = lines[start_line-1:end_line]
    
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    has_error = False
    for idx, l in enumerate(comp_lines, start_line):
        for c_idx, ch in enumerate(l, 1):
            if ch in '({[':
                stack.append((ch, idx, c_idx))
            elif ch in ')}]':
                if stack:
                    top, l_num, c_num = stack.pop()
                    if top != pairs[ch]:
                        print(f"[{func_name}] Mismatch: {top} (line {l_num}:{c_num}) closed by {ch} (line {idx}:{c_idx})")
                        has_error = True
                else:
                    print(f"[{func_name}] Extra closing {ch} at line {idx}:{c_idx}")
                    has_error = True
    if stack:
        print(f"[{func_name}] Unclosed count: {len(stack)}, first: {stack[0]}")
    elif not has_error:
        print(f"[{func_name}] Lines {start_line}-{end_line}: OK")
