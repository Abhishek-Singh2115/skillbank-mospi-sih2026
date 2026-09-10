import re

with open('index.html', encoding='utf-8') as f:
    text = f.read()

script_match = re.search(r'<script type="text/babel">([\s\S]*?)</script>', text)
if not script_match:
    print("No script")
    exit(1)

code = script_match.group(1)
print(f"Code extracted, {len(code)} characters.")

# Let's check for undefined variables or broken tags
# Specifically, where is GoogleOAuthProvider or App wrapped?
# Look at the root rendering:
print("--- End of script ---")
print("\n".join(code.split("\n")[-30:]))
