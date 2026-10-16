# customer-workspace-demo

This repository contains synthetic demonstration records only. Live site: https://maoduuom.github.io/customer-workspace-demo/.

Records edited in the site are stored in each visitor's browser. They are not shared between colleagues or synchronised across devices.

The demo is a static prototype and should not be used for real customer information.

## Customer records

- **Contact:** Main contact, secondary contact and super user are independent checkboxes. The super user flag can be changed directly in the table or in the contact editor. Contact CSV exports include it.
- **Contract:** Each contract has its own status, dates, account manager, cost in GBP, auto renew setting and comment. The current contract's account manager also appears in the customer overview and lists. Contracted days remaining is calculated from the end date; 60–99 days appears in dark orange and fewer than 60 days in dark pink. Archived customers have 0 days remaining.
- **Training:** The top table shows the allowance and balance for each contract period. Select a period to see its training days below. Each training day has a date, title, HED contact, location (Teams or On-site), days taken and summary, so one period can contain several training days. Choose the location in the row or the training day editor; the row selection saves immediately. The running balance follows training date order, and entries must fall within the selected period and its allowance. Existing training days show "Choose location" until a location is selected.

Changes save automatically in the visitor's browser. Existing saved demo records are updated to the new fields when opened.
