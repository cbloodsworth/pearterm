def format_json_line(i, r, g, b):
    r = hex(r)[2:]
    g = hex(g)[2:]
    b = hex(b)[2:]

    if (len(r)) == 1: r= '0'+r
    if (len(g)) == 1: g= '0'+g
    if (len(b)) == 1: b= '0'+b
    
    hex_string = f"{r}{g}{b}"

    return '  "'+str(i)+'": {"color": "#'+hex_string+'"},'

i = 16

print("{")
print("""  "default": {},
  "0": {"color": "#000000"},
  "1": {"color": "#bb0000"},
  "2": {"color": "#00bb00"},
  "3": {"color": "#bbbb00"},
  "4": {"color": "#0000bb"},
  "5": {"color": "#bb00bb"},
  "6": {"color": "#00bbbb"},
  "7": {"color": "#bbbbbb"},
  "8": {"color": "#555555"},
  "9": {"color": "#ff5555"},
  "10": {"color": "#55ff55"},
  "11": {"color": "#ffff55"},
  "12": {"color": "#5555ff"},
  "13": {"color": "#ff55ff"},
  "14": {"color": "#55ffff"},
  "15": {"color": "#ffffff"},""")

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
