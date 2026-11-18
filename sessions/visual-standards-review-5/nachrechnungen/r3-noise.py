import json, numpy as np, sys
rng=np.random.default_rng(1)
base='/tmp/claude-0/-home-user-PowerBI-Kitchen-/2342c566-e44f-5b13-a2f2-19327688094d/scratchpad/'
def flipnoise(P, n, reps=20):
    P=np.array(P); P=np.clip(P,0,None); P=P/P.sum(1,keepdims=True)
    fl=[]
    for _ in range(reps):
        a=np.array([rng.multinomial(n,p) for p in P]); b=np.array([rng.multinomial(n,p) for p in P])
        # tie-breaking like python max(range) -> first index
        fl.append(np.mean(a.argmax(1)!=b.argmax(1)))
    return np.mean(fl)
# 10k main run, 200 futures
R=[]
for i in range(4): R+=json.load(open(base+f'mc10k-{i}.json'))['results']
P=[r['modes']['konzern']['win'] for r in R]
print('10k firms', len(P), 'noise flip n=100:', round(flipnoise(P,100,5),3), ' n=200:', round(flipnoise(P,200,5),3))
# CF A-runs as truth
for k in ['certonly','sla','bibliothek','groesse','lizenzpreis','copilot']:
    A=json.load(open(base+f'cf/cf-{k}-A.mc.json'))['results']
    print(k, 'noise flip (A as truth, n=100 unpaired):', round(flipnoise([r['modes']['konzern']['win'] for r in A],100,20),3))
