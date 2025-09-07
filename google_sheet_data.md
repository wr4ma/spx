Google Sheet ID: 19SS9GPTAkEoEQbw9QEaUMDtNKUuAqotZdRW7UoYaNDQ
Google Sheet GID: 443866641
URL: https://docs.google.com/spreadsheets/d/19SS9GPTAkEoEQbw9QEaUMDtNKUuAqotZdRW7UoYaNDQ/export?format=csv&gid=443866641

The data is structured as follows:
- The dashboard metrics are taken from specific cells:
    - FM Projection: cell A2
    - UPCOMING DC: cell B2
    - PRODUCTIVITY (Actual Inbound, Gap Inbound, Actual Outbound, Gap Outbound): cells D2, D3, D4, D5
    - PENDING PARCEL (Pending Packed, Pending Loading, Antrian, Proses Bongkar): cells F2, F3, H2, H3
- The tables for "Manpower Plan," "Hourly Performance Report," and "List Operator Diluar Floor" are populated from various columns within the same sheet.
- "Manpower Plan" data starts from row 2, and columns S through Z are used.
- "Hourly Performance Report" data starts from row 2, and columns J through P are used.
- "PIC Task" data is in columns AB and AC.
- "List Operator Diluar Floor" data is in columns AE through AM.
- The script fetches the entire sheet as a CSV and then extracts the necessary data based on column and row indices.