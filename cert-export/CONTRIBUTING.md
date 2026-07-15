# Contributing to ChartKitchen byDatenWG

Thanks for your interest in improving the visual. Contributions — bug reports,
fixes, and features — are welcome, including from organizations that want to
extend it for their own reporting.

## License of contributions

This project is licensed under the **Apache License, Version 2.0** (see
`LICENSE`). By submitting a contribution you agree that it is provided under the
same license.

## Developer Certificate of Origin (DCO)

We use the [Developer Certificate of Origin](https://developercertificate.org/)
instead of a CLA. It is a lightweight statement that you have the right to
submit the code. Certify it by adding a `Signed-off-by` line to each commit:

```
Signed-off-by: Your Name <your.email@example.com>
```

`git commit -s` adds this line automatically. The name and email must be real.

By signing off you certify the DCO (v1.1):

> (a) The contribution was created in whole or in part by me and I have the
>     right to submit it under the open source license indicated in the file; or
> (b) The contribution is based upon previous work that, to the best of my
>     knowledge, is covered under an appropriate open source license and I have
>     the right under that license to submit that work with modifications; or
> (c) The contribution was provided directly to me by some other person who
>     certified (a), (b) or (c) and I have not modified it.
> (d) I understand and agree that this project and the contribution are public
>     and that a record of the contribution (including all personal information
>     I submit with it, including my sign-off) is maintained indefinitely.

## Build & verify

```bash
npm ci
npx eslint src/          # must pass clean
npm run test:render      # headless render suite (needs Chromium/Playwright)
npx pbiviz package       # produces dist/*.pbiviz
```

## Ground rules

- **No external services.** The visual makes no network requests and embeds no
  external code; keep it that way (Microsoft certification depends on it).
- **Localize UI strings.** New user-facing text goes into all four
  `stringResources/<locale>/resources.resjson` files (de-DE, en-US, es-ES,
  ja-JP) via `locStr(...)` / `displayNameKey`, never hard-coded.
- **Match the surrounding style.** Keep comment density and naming consistent
  with the existing code; run ESLint before opening a PR.
- **Don't use the project's name or logo** for your fork (see NOTICE) — the
  Apache license covers the code, not the brand.

## Reporting issues

Use the issue tracker. For bugs, include the Power BI Desktop version, the
field bindings, and a minimal repro (a sample PBIX or the data shape).
