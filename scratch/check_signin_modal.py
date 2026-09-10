with open('index.html', encoding='utf-8') as f:
    text = f.read()

lines = text.split("\n")
modal_lines = lines[1454:1596]

stack = []
pairs = {')': '(', ']': '[', '}': '{'}
for idx, l in enumerate(modal_lines, 1455):
    for c_idx, ch in enumerate(l, 1):
        if ch in '({[':
            stack.append((ch, idx, c_idx))
        elif ch in ')}]':
            if stack:
                top, l_num, c_num = stack.pop()
                if top != pairs[ch]:
                    print(f"Mismatch inside SignInModal: {top} from line {l_num}:{c_num} closed with {ch} at {idx}:{c_idx}")
            else:
                print(f"Extra closing {ch} at {idx}:{c_idx}")

if stack:
    print("Unclosed in SignInModal:", stack)
else:
    print("SignInModal is 100% BALANCED!")
