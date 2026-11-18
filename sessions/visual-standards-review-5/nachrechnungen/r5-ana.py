import json, sys, os
D = os.path.dirname(os.path.abspath(__file__))
O = ["paid", "oss", "deneb", "core", "none"]
def load(p):
    return {r["id"]: r for r in json.load(open(p))["results"]}
base = load(os.path.join(D, "../../oss1fte/gepflegt-0.mc.json"))
heute = load(os.path.join(D, "../../oss1fte/heute-0.mc.json"))
ids = list(base)
U = sum(heute[i]["users"] for i in ids)
maj = lambda r: max(range(5), key=lambda j: r["modes"]["konzern"]["win"][j])
def summ(name, R):
    firms = [sum(R[i]["modes"]["konzern"]["win"][j] for i in ids) / len(ids) for j in range(5)]
    users = [sum(R[i]["users"] * R[i]["modes"]["konzern"]["win"][j] for i in ids) / U for j in range(5)]
    om = sum(maj(R[i]) == 1 for i in ids) / len(ids)
    flipg = sum(maj(R[i]) != maj(base[i]) for i in ids) / len(ids)
    print(f"{name:16s} firms " + " ".join(f"{O[j]}={100*firms[j]:4.1f}" for j in range(5)) +
          f" | OSS users {100*users[1]:4.1f} | OSS-maj {100*om:4.1f} | flip vs gepflegt {100*flipg:4.1f}")
summ("heute", heute)
summ("gepflegt", base)
for v in sys.argv[1:]:
    p = os.path.join(D, v + ".mc.json")
    if os.path.exists(p):
        summ(v, load(p))
