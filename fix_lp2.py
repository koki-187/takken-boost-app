with open(r'C:/takken-build/src/index-v9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find renderLP and replace its template literal backticks with escaped ones
# The function starts at "function renderLP() {"
start = content.find('function renderLP() {')
if start == -1:
    print('renderLP not found')
    exit()

# Find the end of the function - looking for the closing brace at proper indent
# Pattern: innerHTML = `...`; \n}
end_marker = '`;\n}\n\n// ===== FLASHCARD'
end = content.find(end_marker, start)
if end == -1:
    print('end marker not found')
    exit()

# The function body
func_body = content[start:end + len(end_marker)]
print(f'Function length: {len(func_body)}')

# Replace the unescaped backticks
# innerHTML = ` <-- need to be \`
# `; <-- need to be \`;
# Note: only the template literal delimiters need escaping, not internal content
# since we don't have any backticks inside

# Find the innerHTML = ` and ` ;
inner_start = func_body.find("innerHTML = `")
inner_end = func_body.rfind('`;')

if inner_start == -1 or inner_end == -1:
    print('inner backticks not found')
    exit()

# Replace those specific backticks
before = func_body[:inner_start]
after = func_body[inner_end + 2:]  # +2 to skip `;
inner_content = func_body[inner_start + len("innerHTML = `"):inner_end]

# Escape: any internal ` or ${ in inner_content (none expected, but safety)
inner_escaped = inner_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

new_func_body = before + 'innerHTML = \\`' + inner_escaped + '\\`;' + after

content_new = content[:start] + new_func_body + content[end + len(end_marker):]

with open(r'C:/takken-build/src/index-v9.tsx', 'w', encoding='utf-8') as f:
    f.write(content_new)

print('Fixed')
