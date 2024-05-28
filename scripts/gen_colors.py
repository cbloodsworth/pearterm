def format_json_line(i, r, g, b):
    r = hex(r)[2:]
    g = hex(g)[2:]
    b = hex(b)[2:]

    if (len(r)) == 1: r= '0'+r
    if (len(g)) == 1: g= '0'+g
    if (len(b)) == 1: b= '0'+b
    
    hex_string = f"{r}{g}{b}"

    hex_idx = hex(i)[2:]
    hex_idx = hex_idx if len(hex_idx) == 2 else '0'+hex_idx

    return '  "'+hex_idx+'": {"color": "#'+hex_string+'"},'

i = 16

print("{")
print("""  "default": {},
  "00": {"color": "#000000"},
  "01": {"color": "#bb0000"},
  "02": {"color": "#00bb00"},
  "03": {"color": "#bbbb00"},
  "04": {"color": "#0000bb"},
  "05": {"color": "#bb00bb"},
  "06": {"color": "#00bbbb"},
  "07": {"color": "#bbbbbb"},
  "08": {"color": "#555555"},
  "09": {"color": "#ff5555"},
  "0a": {"color": "#55ff55"},
  "0b": {"color": "#ffff55"},
  "0c": {"color": "#5555ff"},
  "0d": {"color": "#ff55ff"},
  "0e": {"color": "#55ffff"},
  "0f": {"color": "#ffffff"},""")

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
