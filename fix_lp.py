import re

with open(r'C:/takken-build/src/index-v9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the renderLP innerHTML template literal
pattern = r'(function renderLP\(\) \{\s*document\.body\.classList\.add\(\'lp-mode\'\);\s*document\.getElementById\(\'main\'\)\.innerHTML = )`(.+?)`;(\s*\})'
m = re.search(pattern, content, re.DOTALL)

if not m:
    print('Pattern not found')
else:
    head = m.group(1)
    body = m.group(2)
    tail = m.group(3)

    # Escape for outer template literal: \ first, then ` and ${
    body_escaped = body.replace('\\', '\\\\')
    body_escaped = body_escaped.replace('`', '\\`')
    body_escaped = body_escaped.replace('${', '\\${')

    new_func = head + '`' + body_escaped + '`;' + tail
    content_new = content[:m.start()] + new_func + content[m.end():]

    with open(r'C:/takken-build/src/index-v9.tsx', 'w', encoding='utf-8') as f:
        f.write(content_new)

    print(f'Done. orig body: {len(body)}, escaped: {len(body_escaped)}')
