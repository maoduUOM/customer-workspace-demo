# customer-workspace-demo

This repository contains synthetic demonstration records only. Live site: https://maoduuom.github.io/customer-workspace-demo/.

Records edited in the site are stored in each visitor's browser. They are not shared between colleagues or synchronised across devices.

The demo is a static prototype and should not be used for real customer information.

## Customer records

- **Contact:** Main contact, secondary contact and super user are independent checkboxes. The super user flag can be changed directly in the table or in the contact editor. Contact CSV exports include it.
- **Contract:** The contract table lists each agreement's status, dates, account manager, cost in GBP, auto renew setting and comment. The current contract's account manager also appears in the customer overview and lists. Contracted days remaining is calculated from the end date; 60–99 days appears in dark orange and fewer than 60 days in dark pink. Archived customers have 0 days remaining.
- **Training:** All contract periods and their training days appear together on one page. Each section shows its contract dates, allowance, usage and balance, followed by that period's dated training rows. Add training day is disabled for historical periods. Each training day has a title, HED contact, free-text location, days taken and summary. Enter the location in the row or the training day editor; changes in the row save as you type. The running balance follows training date order, and entries must fall within the period and its allowance. New periods are linked to a contract; existing training days without a location show "Add location" until filled in.

DEMO001–DEMO003 include synthetic previous contracts and training days. DEMO001 also has a draft renewal. The examples are added once when these customers have one contract and an empty training period. Customers with existing training entries or multiple contracts are left as they are, and deleted examples are not recreated.

Changes save automatically in the visitor's browser. Existing saved demo records are updated to the new fields when opened.
