with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<script type="text/babel">'
end_marker = '</script>'
start_idx = content.find(start_marker)
end_idx = content.rfind(end_marker)

if start_idx != -1 and end_idx != -1:
    js_code = content[start_idx + len(start_marker):end_idx]
    print('JS code length:', len(js_code))
    print('Curly:', js_code.count('{'), 'vs', js_code.count('}'))
    print('Paren:', js_code.count('('), 'vs', js_code.count(')'))
    print('Bracket:', js_code.count('['), 'vs', js_code.count(']'))
else:
    print('Markers not found')
