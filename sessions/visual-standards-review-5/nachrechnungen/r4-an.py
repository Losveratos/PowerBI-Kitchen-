import json,sys
from collections import Counter
K=['paid','oss','deneb','core']
def an(fn,label,score_w=None):
    R=json.load(open(fn)); n=len(R)
    free=Counter();ok=Counter();okstrict=Counter()
    for ko,mw,sc,exp,v,h,seg in R:
        free[K[min(range(4),key=lambda i:exp[i])]]+=1
        el=[i for i in range(4) if not ko[i]]
        if el: ok[K[min(el,key=lambda i:exp[i])]]+=1
        else: ok['none']+=1
        # strict: must-warn counts as ineligible; if no remaining, none
        el2=[i for i in el if mw[i]==0]
        if el2: okstrict[K[min(el2,key=lambda i:exp[i])]]+=1
        else: okstrict['none']+=1
    f=lambda c:' '.join(f'{k}:{100*c[k]/n:4.1f}' for k in K+['none'])
    print(f'{label:34s} free[{f(free)}]\n{"":34s} ok  [{f(ok)}]\n{"":34s} strict(no Must-warn)[{f(okstrict)}]')
if __name__=='__main__':
    for a in sys.argv[1:]: an(a,a)
