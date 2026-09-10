with open('index.html', encoding='utf-8') as f:
    text = f.read()

# Let's check lines 1186 to 1452 (TopicQuizModal) specifically!
lines = text.split("\n")
topic_modal_lines = lines[1185:1453]

stack = []
pairs = {')': '(', ']': '[', '}': '{'}
for idx, l in enumerate(topic_modal_lines, 1186):
    for c_idx, ch in enumerate(l, 1):
        if ch in '({[':
            stack.append((ch, idx, c_idx))
        elif ch in ')}]':
            if stack:
                top, l_num, c_num = stack.pop()
                if top != pairs[ch]:
                    print(f"Mismatch inside TopicQuizModal: {top} from line {l_num}:{c_num} closed with {ch} at {idx}:{c_idx}")
            else:
                print(f"Extra closing {ch} at {idx}:{c_idx}")

if stack:
    print("Unclosed in TopicQuizModal:", stack)
else:
    print("TopicQuizModal is 100% BALANCED!")
