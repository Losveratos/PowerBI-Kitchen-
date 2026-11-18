import json,sys,math
from collections import Counter
K=['paid','oss','deneb','core']
def run(fn,w):
    R=json.load(open(fn));n=len(R);c=Counter();sc_win=Counter();
    for ko,mw,sc,exp,v,h,seg in R:
        cmin=max(1,min(exp))
        el=[i for i in range(4) if not ko[i]]
        if not el: c['none']+=1;continue
        rv=lambda i:w*min(1.5,math.log(max(exp[i],1)/cmin)/math.log(4))+(1-w)*(1-sc[i]/100)
        b=min(el,key=rv);c[K[b]]+=1
    return ' '.join(f'{k}:{100*c[k]/n:4.1f}' for k in K+['none'])
for fn in sys.argv[1:]:
    for w in (1.0,0.7,0.5):
        print(fn,'w=',w,run(fn,w))
# mean score per way
R=json.load(open('base.json'))
print('mean scorePct',[round(sum(r[2][i] for r in R)/len(R),1) for i in range(4)])
print('share firms with >=1 must-warn',[round(sum(1 for r in R if r[1][i]>0)/len(R)*100,1) for i in range(4)])
print('mean must-warn count',[round(sum(r[1][i] for r in R)/len(R),2) for i in range(4)])
