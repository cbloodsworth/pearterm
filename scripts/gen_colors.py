def format_json_line(i, r, g, b):
    hex_string = f"{hex(r)[2:]}{hex(g)[2:]}{hex(b)[2:]}"
    while len(hex_string) < 6:
        hex_string = '0' + hex_string

    hex_idx = hex(i)[2:]
    hex_idx = hex_idx if len(hex_idx) == 2 else '0'+hex_idx

    return '  "'+hex_idx+'": {color: "#'+hex_string+'},'

i = 16
for r in range(55, 256, 40):
    if (r == 55): r = 0 
    for g in range(55, 256, 40):
        if (g == 55): g = 0
        for b in range(55, 256, 40):
            if (b == 55): b = 0
            print(format_json_line(i, r, g, b))
            i += 1

for m in range(8, 239, 10):
    print(format_json_line(i, m, m, m))
    i += 1

print("}")
