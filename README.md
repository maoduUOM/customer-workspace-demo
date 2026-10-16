# customer-workspace-demo

This repository contains synthetic demonstration records only. Live site: https://maoduuom.github.io/customer-workspace-demo/.

Records edited in the site are stored in each visitor's browser. They are not shared between colleagues or synchronised across devices.

The demo is a static prototype and should not be used for real customer information.

## Customer records

- **Create new customer:** A customer can be created before a contract is signed. Contract dates and auto renew can be entered later in the Contract tab; training allowance can be added in the Training tab after a contract exists. Until then, the contract and training values show as not set. Archiving remains unavailable until a signed contract has ended.
- **Customer list:** The list shows 50 customers per page by default. Active rows offer Archive when all non-draft contracts have ended; archived rows offer Restore. Customer deletion is not available from the list.
- **Contact:** Main contact, secondary contact and super user are independent checkboxes. The super user flag can be changed directly in the table or in the contact editor. Contact CSV exports include it.
- **Alert:** Each customer can select any combination of Alert1–Alert4 in the Alert tab. The selections appear below Licence coverage on Overview and in the customer CSV export. New and older saved demo records without an alerts field receive example selections for DEMO001–DEMO003; existing selections, including an empty selection, are preserved. Alerts are labels only and do not send notifications.
- **Contract:** The contract table lists each agreement's status, dates, account manager, cost in GBP, auto renew setting and comment. The current contract's account manager also appears in the customer overview and lists. Contracted days remaining is calculated from the end date; 60–99 days appears in dark orange and fewer than 60 days in dark pink. Archived customers have 0 days remaining.
- **Colour-rule examples:** On a fresh browser copy, DEMO001's current contract ends 45 days after that day's visit and DEMO004's ends 80 days after it, showing the dark pink and dark orange rules. These dates are seeded once per browser; previously saved or manually edited records keep their own dates.
- **Training:** All contract periods and their training days appear together on one page. Each section has a dated training table; the days remaining column shows the balance after each training day. Historical periods are read-only: period and training-day buttons and location fields are disabled. Each training day has a title, HED contact, free-text location, days taken and summary. For current periods, enter the location in the row or the training day editor; changes in the row save as you type. The running balance follows training date order, and entries must fall within the period and its allowance. New periods are linked to a contract; existing training days without a location show "Add location" until filled in.

DEMO001–DEMO003 include synthetic previous contracts and training days. DEMO001 also has a draft renewal. Fresh browser copies receive these examples once. Older browser copies with an empty current training period receive three synthetic training days when the period has at least 1.5 days available. They also receive a missing historical demo contract, period or training days on the next page load. Existing training entries, contract details and allowances are preserved. Deleted examples are not recreated after this one-time update.

Changes save automatically in the visitor's browser. Existing saved demo records are updated to the new fields when opened.
