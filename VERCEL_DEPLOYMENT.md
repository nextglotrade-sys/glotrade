01:45:46.206 Running build in Washington, D.C., USA (East) – iad1
01:45:46.206 Build machine configuration: 2 cores, 8 GB
01:45:46.262 Cloning github.com/kaaysolstore-sudo/kaaysol-web (Branch: main, Commit: 26f027e)
01:45:46.263 Skipping build cache, deployment was triggered without cache.
01:45:46.916 Cloning completed: 653.000ms
01:45:47.441 Running "vercel build"
01:45:47.456 Vercel CLI 59.23.2
01:45:47.471 > Detected Turbo. Adjusting default settings...
01:45:47.672 Running "install" command: `npm install --prefix=../..`...
01:45:51.872 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
01:45:52.572 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
01:45:52.648 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
01:45:53.447 npm warn deprecated @types/dotenv@8.2.3: This is a stub types definition. dotenv provides its own type definitions, so you do not need this installed.
01:45:54.185 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
01:45:54.420 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
01:46:04.342 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
01:47:19.216 
01:47:19.216 added 1153 packages, and audited 1156 packages in 2m
01:47:19.217 
01:47:19.217 271 packages are looking for funding
01:47:19.217   run `npm fund` for details
01:47:19.633 
01:47:19.634 36 vulnerabilities (2 low, 10 moderate, 21 high, 3 critical)
01:47:19.634 
01:47:19.634 To address issues that do not require attention, run:
01:47:19.634   npm audit fix
01:47:19.634 
01:47:19.635 To address all issues (including breaking changes), run:
01:47:19.635   npm audit fix --force
01:47:19.635 
01:47:19.635 Run `npm audit` for details.
01:47:19.636 npm warn allow-scripts 4 packages have install scripts not yet covered by allowScripts:
01:47:19.636 npm warn allow-scripts   @parcel/watcher@2.5.1 (install: node scripts/build-from-source.js)
01:47:19.636 npm warn allow-scripts   @swc/core@1.15.7 (postinstall: node postinstall.js)
01:47:19.637 npm warn allow-scripts   sharp@0.34.5 (install: node install/check.js || npm run build)
01:47:19.637 npm warn allow-scripts   unrs-resolver@1.11.1 (postinstall: napi-postinstall unrs-resolver 1.11.1 check)
01:47:19.637 npm warn allow-scripts
01:47:19.637 npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
01:47:19.724 Detected Next.js version: 15.5.12
01:47:19.726 Running "cd ../.. && turbo run build --filter={apps/web}..."
01:47:19.779 
01:47:19.780 Attention:
01:47:19.780 Turborepo now collects completely anonymous telemetry regarding usage.
01:47:19.788 This information is used to shape the Turborepo roadmap and prioritize features.
01:47:19.788 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
01:47:19.788 https://turborepo.com/docs/telemetry
01:47:19.788 
01:47:19.797  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
01:47:19.798    x Could not resolve workspaces.
01:47:19.798   `-> Lockfile not found at /vercel/path0/yarn.lock
01:47:19.798 
01:47:19.801 • Packages in scope: web
01:47:19.802 • Running build in 1 packages
01:47:19.802 • Remote caching enabled
01:47:19.947 web:build: cache bypass, force executing b1e292e074169200
01:47:20.222 web:build: yarn run v1.22.19
01:47:20.257 web:build: $ next build
01:47:21.198 web:build: Attention: Next.js now collects completely anonymous telemetry regarding usage.
01:47:21.198 web:build: This information is used to shape Next.js' roadmap and prioritize features.
01:47:21.198 web:build: You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
01:47:21.198 web:build: https://nextjs.org/telemetry
01:47:21.198 web:build: 
01:47:21.317 web:build:    ▲ Next.js 15.5.12
01:47:21.317 web:build:    - Experiments (use with caution):
01:47:21.318 web:build:      · optimizePackageImports
01:47:21.318 web:build: 
01:47:21.397 web:build:    Creating an optimized production build ...
01:47:25.730 web:build: [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
01:47:25.971 web:build: Browserslist: browsers data (caniuse-lite) is 10 months old. Please run:
01:47:25.972 web:build:   npx update-browserslist-db@latest
01:47:25.972 web:build:   Why you should do it regularly: https://github.com/browserslist/update-db#readme
01:47:49.792 web:build:  ✓ Compiled successfully in 28.2s
01:47:49.799 web:build:    Skipping linting
01:47:49.802 web:build:    Checking validity of types ...
01:48:08.986 web:build:    Collecting page data ...
01:48:14.367 web:build:    Generating static pages (0/90) ...
01:48:17.829 web:build:    Generating static pages (22/90) 
01:48:18.518 web:build:    Generating static pages (44/90) 
01:48:19.572 web:build:    Generating static pages (67/90) 
01:48:20.186 web:build:  ✓ Generating static pages (90/90)
01:48:22.693 web:build:    Finalizing page optimization ...
01:48:22.694 web:build:    Collecting build traces ...
01:48:33.707 web:build: 
01:48:33.713 web:build: Route (app)                                 Size  First Load JS  Revalidate  Expire
01:48:33.713 web:build: ┌ ○ /                                    7.55 kB         318 kB          5m      1y
01:48:33.713 web:build: ├ ○ /_not-found                            995 B         104 kB
01:48:33.713 web:build: ├ ○ /about                                3.4 kB         316 kB
01:48:33.713 web:build: ├ ○ /admin                               12.4 kB         191 kB
01:48:33.713 web:build: ├ ○ /admin/analytics                     5.35 kB         187 kB
01:48:33.713 web:build: ├ ○ /admin/banners                       6.14 kB         116 kB
01:48:33.713 web:build: ├ ○ /admin/bazaar                        61.6 kB         174 kB
01:48:33.714 web:build: ├ ○ /admin/coupons                       8.71 kB         319 kB
01:48:33.714 web:build: ├ ○ /admin/credit-requests               7.75 kB         118 kB
01:48:33.714 web:build: ├ ○ /admin/gdip                          9.12 kB         323 kB
01:48:33.714 web:build: ├ ○ /admin/gdip/commodities              4.34 kB         117 kB
01:48:33.714 web:build: ├ ○ /admin/gdip/cycles                      6 kB         316 kB
01:48:33.714 web:build: ├ ○ /admin/gdip/cycles/create            4.69 kB         107 kB
01:48:33.714 web:build: ├ ƒ /admin/gdip/gdc/[id]                 4.85 kB         115 kB
01:48:33.714 web:build: ├ ○ /admin/gdip/gdcs                     6.07 kB         316 kB
01:48:33.715 web:build: ├ ○ /admin/gdip/partners                 7.16 kB         117 kB
01:48:33.715 web:build: ├ ○ /admin/gdip/tpias                    5.89 kB         320 kB
01:48:33.715 web:build: ├ ○ /admin/managers                       7.3 kB         117 kB
01:48:33.715 web:build: ├ ○ /admin/managers/new                  5.35 kB         115 kB
01:48:33.715 web:build: ├ ○ /admin/orders                        13.9 kB        2.41 MB
01:48:33.716 web:build: ├ ○ /admin/product-managers                390 B         103 kB
01:48:33.716 web:build: ├ ○ /admin/product-managers/new            389 B         103 kB
01:48:33.718 web:build: ├ ○ /admin/products                      10.4 kB         120 kB
01:48:33.718 web:build: ├ ƒ /admin/products/[id]                 7.34 kB         2.6 MB
01:48:33.718 web:build: ├ ○ /admin/products/new                  8.83 kB         323 kB
01:48:33.718 web:build: ├ ○ /admin/reports                       14.8 kB         125 kB
01:48:33.718 web:build: ├ ○ /admin/sales-agents                  6.09 kB         116 kB
01:48:33.718 web:build: ├ ○ /admin/security                      6.59 kB         119 kB
01:48:33.719 web:build: ├ ○ /admin/settings                      13.1 kB         125 kB
01:48:33.719 web:build: ├ ○ /admin/store                         8.31 kB         318 kB
01:48:33.719 web:build: ├ ○ /admin/users                         12.1 kB         122 kB
01:48:33.719 web:build: ├ ○ /admin/wallets                       8.97 kB         121 kB
01:48:33.719 web:build: ├ ○ /admin/withdrawals                   7.89 kB         318 kB
01:48:33.719 web:build: ├ ○ /agent/commissions                   5.12 kB         308 kB
01:48:33.719 web:build: ├ ○ /agent/dashboard                     5.19 kB         308 kB
01:48:33.719 web:build: ├ ○ /agent/referrals                     4.88 kB         308 kB
01:48:33.719 web:build: ├ ○ /auth/forgot                         4.92 kB         311 kB
01:48:33.719 web:build: ├ ○ /auth/login                          6.34 kB         312 kB
01:48:33.719 web:build: ├ ○ /auth/reactivate                      4.2 kB         310 kB
01:48:33.719 web:build: ├ ○ /auth/register                         591 B         303 kB
01:48:33.719 web:build: ├ ○ /auth/register-business              6.62 kB         313 kB
01:48:33.719 web:build: ├ ○ /auth/reset                          5.36 kB         311 kB
01:48:33.719 web:build: ├ ○ /auth/verify                         3.86 kB         310 kB
01:48:33.719 web:build: ├ ○ /bazaar                              8.34 kB         325 kB
01:48:33.719 web:build: ├ ○ /bazaar/about                        4.38 kB         315 kB
01:48:33.719 web:build: ├ ○ /bazaar/callback                     3.54 kB         325 kB
01:48:33.719 web:build: ├ ○ /bazaar/contact                       3.7 kB         315 kB
01:48:33.719 web:build: ├ ○ /bazaar/exhibitors                   3.64 kB         320 kB
01:48:33.720 web:build: ├ ○ /bazaar/gallery                      2.64 kB         314 kB
01:48:33.720 web:build: ├ ○ /bazaar/programme                    3.56 kB         314 kB
01:48:33.720 web:build: ├ ○ /bazaar/sponsorship                  4.01 kB         320 kB
01:48:33.720 web:build: ├ ○ /bazaar/terms                        6.43 kB         317 kB
01:48:33.720 web:build: ├ ○ /bazaar/tickets                      4.21 kB         321 kB
01:48:33.720 web:build: ├ ○ /bazaar/venue                        3.27 kB         314 kB
01:48:33.720 web:build: ├ ○ /bazaar/verify                       4.24 kB         315 kB
01:48:33.720 web:build: ├ ƒ /best-selling                        1.49 kB         312 kB
01:48:33.720 web:build: ├ ○ /cart                                4.58 kB         2.6 MB
01:48:33.720 web:build: ├ ○ /checkout                            14.1 kB        2.61 MB
01:48:33.720 web:build: ├ ○ /checkout/callback                   1.81 kB         305 kB
01:48:33.720 web:build: ├ ○ /checkout/success                    4.97 kB         311 kB
01:48:33.720 web:build: ├ ○ /dashboard                           8.76 kB         315 kB
01:48:33.720 web:build: ├ ○ /gdip                                6.18 kB         309 kB
01:48:33.720 web:build: ├ ○ /gdip/cycles                         5.75 kB         308 kB
01:48:33.727 web:build: ├ ○ /gdip/purchase                       6.06 kB         309 kB
01:48:33.727 web:build: ├ ○ /gdip/statement                      6.29 kB         309 kB
01:48:33.727 web:build: ├ ƒ /gdip/tpia/[id]                      6.27 kB         309 kB
01:48:33.727 web:build: ├ ƒ /gdip/tpia/[id]/certificate          4.35 kB         317 kB
01:48:33.727 web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing     1.8 kB         305 kB
01:48:33.728 web:build: ├ ƒ /gdip/tpia/[id]/invoice              5.86 kB         309 kB
01:48:33.728 web:build: ├ ○ /gdip/tpias                          5.08 kB         308 kB
01:48:33.728 web:build: ├ ○ /icon.png                                0 B            0 B
01:48:33.728 web:build: ├ ƒ /marketplace                           210 B         315 kB
01:48:33.728 web:build: ├ ƒ /marketplace/[id]                    9.03 kB         324 kB
01:48:33.728 web:build: ├ ○ /orders                              8.13 kB         314 kB
01:48:33.728 web:build: ├ ƒ /orders/[id]                         6.99 kB         318 kB
01:48:33.728 web:build: ├ ○ /privacy-policy                      3.72 kB         310 kB
01:48:33.728 web:build: ├ ○ /profile                             17.6 kB        2.61 MB
01:48:33.729 web:build: ├ ○ /profile/notifications               4.33 kB         309 kB
01:48:33.729 web:build: ├ ○ /profile/reviews                     3.69 kB         110 kB
01:48:33.729 web:build: ├ ○ /profile/vouchers                    7.42 kB         314 kB
01:48:33.729 web:build: ├ ○ /profile/wallet                      18.1 kB         324 kB
01:48:33.729 web:build: ├ ○ /profile/wallet/analytics            7.35 kB         310 kB
01:48:33.729 web:build: ├ ○ /profile/wallet/callback             3.86 kB         307 kB
01:48:33.729 web:build: ├ ○ /refund-policy                       4.13 kB         310 kB
01:48:33.731 web:build: ├ ƒ /s/[slug]                            3.09 kB         318 kB
01:48:33.731 web:build: ├ ƒ /s/[slug]/about                        165 B         106 kB
01:48:33.731 web:build: ├ ○ /security/fraud-cases                2.45 kB         309 kB
01:48:33.731 web:build: ├ ○ /security/report                     2.19 kB         308 kB
01:48:33.731 web:build: ├ ○ /security/report/communication       4.55 kB         311 kB
01:48:33.731 web:build: ├ ○ /security/report/jobs                4.92 kB         311 kB
01:48:33.731 web:build: ├ ○ /security/report/website             4.66 kB         311 kB
01:48:33.731 web:build: ├ ○ /shipping-policy                     3.93 kB         310 kB
01:48:33.731 web:build: ├ ○ /sitemap.xml                           125 B         103 kB          1h      1y
01:48:33.731 web:build: ├ ○ /support                             5.63 kB         312 kB
01:48:33.731 web:build: ├ ○ /terms-of-service                    4.46 kB         311 kB
01:48:33.731 web:build: ├ ƒ /verify/[id]                            4 kB         107 kB
01:48:33.731 web:build: ├ ○ /wallet/share                        6.71 kB         309 kB
01:48:33.731 web:build: └ ○ /wishlist                            3.47 kB         314 kB
01:48:33.731 web:build: + First Load JS shared by all             103 kB
01:48:33.731 web:build:   ├ chunks/18-699b572434d445b7.js        46.3 kB
01:48:33.731 web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
01:48:33.731 web:build:   └ other shared chunks (total)          2.08 kB
01:48:33.731 web:build: 
01:48:33.732 web:build: 
01:48:33.732 web:build: ○  (Static)   prerendered as static content
01:48:33.732 web:build: ƒ  (Dynamic)  server-rendered on demand
01:48:33.732 web:build: 
01:48:33.829 web:build: Done in 73.61s.
01:48:33.901 
01:48:33.903   Tasks:    1 successful, 1 total
01:48:33.903  Cached:    0 cached, 1 total
01:48:33.903    Time:    1m14.115s 
01:48:33.903 Summary:    /vercel/path0/.turbo/runs/3Jf35dibWXZO4bCgTxblfE5tHEM.json
01:48:33.903 
01:48:40.601 Traced Next.js server files in: 53.795ms
01:48:41.114 Created all serverless functions in: 511.807ms
01:48:41.145 Collected static files (public/, static/, .next/static): 18.44ms
01:48:41.485 Build Completed in /vercel/output [3m]
01:48:41.505 Deploying outputs...