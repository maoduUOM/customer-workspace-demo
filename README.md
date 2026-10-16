# customer-workspace-demo

This repository contains synthetic demonstration records only. Live site: https://maoduuom.github.io/customer-workspace-demo/.

Records edited in the site are stored in each visitor's browser. They are not shared between colleagues or synchronised across devices.

The demo is a static prototype and should not be used for real customer information.

## Customer records

- **Create new customer:** A customer can be created before a contract is signed. Contract dates and auto renew can be entered later in the Contract tab; training allowance can be added in the Training tab after a contract exists. Until then, the contract and training values show as not set. Archiving remains unavailable until a signed contract has ended.
- **Delete customer:** Active customer rows have a Delete button beside Archive. Archived rows show Restore only. Deletion asks for confirmation, removes the customer's related records from the current browser, and offers Undo immediately afterward.
- **Contact:** Main contact, secondary contact and super user are independent checkboxes. The super user flag can be changed directly in the table or in the contact editor. Contact CSV exports include it.
- **Contract:** The contract table lists each agreement's status, dates, account manager, cost in GBP, auto renew setting and comment. The current contract's account manager also appears in the customer overview and lists. Contracted days remaining is calculated from the end date; 60–99 days appears in dark orange and fewer than 60 days in dark pink. Archived customers have 0 days remaining.
- **Training:** All contract periods and their training days appear together on one page. Each section has a dated training table; the days remaining column shows the balance after each training day. Historical periods are read-only: period and training-day buttons and location fields are disabled. Each training day has a title, HED contact, free-text location, days taken and summary. For current periods, enter the location in the row or the training day editor; changes in the row save as you type. The running balance follows training date order, and entries must fall within the period and its allowance. New periods are linked to a contract; existing training days without a location show "Add location" until filled in.

DEMO001–DEMO003 include synthetic previous contracts and training days. DEMO001 also has a draft renewal. Fresh browser copies receive these examples once. Older browser copies with an empty current training period receive three synthetic training days on their next page load when the period has at least 1.5 days available. Existing training entries, contract details and allowances are preserved. Deleted examples are not recreated after this one-time update.

Changes save automatically in the visitor's browser. Existing saved demo records are updated to the new fields when opened.
